/**
 * DeskFlow Backend API Server
 * 
 * Internal IT service portal backend built with Express.js and Prisma ORM
 * - Handles user authentication via JWT
 * - Manages service tickets with role-based access control
 * - Provides OpenAPI/Swagger documentation
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Initialize Prisma client for database operations
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || (isProduction ? '' : 'deskflow-secret');

if (isProduction && jwtSecret.length < 32) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters in production');
}

// Enable CORS for cross-origin requests and JSON parsing middleware
app.use(cors());
app.use(express.json());

// Configure OpenAPI/Swagger documentation
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DeskFlow API',
      version: '1.0.0',
      description: 'Internal service request portal API for employees and admins'
    },
    servers: [{ url: `http://localhost:${port}` }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Tickets', description: 'Ticket management endpoints' }
    ]
  },
  apis: []
});

// Serve API documentation at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Create JWT token for authenticated user
 * @param {Object} user - User object with id and role
 * @returns {string} JWT token valid for 8 hours
 */
function createToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });
}

/**
 * Middleware: Verify JWT token from Authorization header
 * Extracts and validates bearer token, attaches decoded user info to request
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Middleware factory: Verify user has specific role
 * @param {string} role - Required role (e.g., 'Admin', 'Employee')
 * @returns {Function} Express middleware function
 */
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Only ${role} users can access this endpoint` });
    }
    next();
  };
}

/**
 * Database seeding: Create default admin and employee users for testing
 * Uses upsert to avoid duplicates on subsequent runs
 */
async function seedUsers() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deskflow.local' },
    update: {},
    create: {
      email: 'admin@deskflow.local',
      password: 'password123',
      name: 'Ava Admin',
      role: 'Admin'
    }
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@deskflow.local' },
    update: {},
    create: {
      email: 'employee@deskflow.local',
      password: 'password123',
      name: 'Ethan Employee',
      role: 'Employee'
    }
  });

  return { admin, employee };
}

async function seedDemoTickets(employee) {
  if (isProduction) {
    return;
  }

  const ticketCount = await prisma.ticket.count({ where: { authorId: employee.id } });
  if (ticketCount > 0) {
    return;
  }

  const now = Date.now();
  await prisma.ticket.createMany({
    data: [
      {
        title: 'Laptop setup for a new starter',
        description: 'A new teammate starts Monday. Please prepare a laptop with the standard development tools.',
        priority: 'Medium',
        status: 'InProgress',
        authorId: employee.id,
        createdAt: new Date(now - 1000 * 60 * 60 * 5)
      },
      {
        title: 'Can’t connect to the office Wi-Fi',
        description: 'The network drops every few minutes on the second floor. Other devices seem to be affected too.',
        priority: 'High',
        status: 'Open',
        authorId: employee.id,
        createdAt: new Date(now - 1000 * 60 * 60 * 26)
      }
    ]
  });

  const createdAt = new Date(now - 1000 * 60 * 60 * 72);
  const resolvedAt = new Date(now - 1000 * 60 * 60 * 48);
  await prisma.ticket.create({
    data: {
      title: 'Request access to the design drive',
      description: 'I need read access to the shared design folder for the upcoming project handoff.',
      priority: 'Low',
      status: 'Resolved',
      authorId: employee.id,
      createdAt,
      resolutions: {
        create: {
          resolvedAt,
          resolutionSeconds: Math.round((resolvedAt.getTime() - createdAt.getTime()) / 1000)
        }
      }
    }
  });
}

// ==================== Health Check Endpoint ====================

/**
 * GET /api/health
 * Returns server status
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DeskFlow API is running' });
});

// ==================== Authentication Endpoints ====================

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 * Returns JWT token and user information
 * 
 * Body: { email: string, password: string }
 * Response: { token: string, user: { id, name, email, role } }
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = createToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// ==================== Ticket Endpoints ====================

/**
 * POST /api/tickets
 * Create new service ticket (Employees only)
 * Requires: Authentication, Employee role
 * 
 * Body: { title: string, description: string, priority: "Low|Medium|High" }
 * Response: Created ticket object with author info
 */
app.post('/api/tickets', authenticate, authorizeRole('Employee'), async (req, res) => {
  const { title, description, priority } = req.body;

  if (!title || !description || !priority) {
    return res.status(400).json({ error: 'Title, description, and priority are required' });
  }

  const validPriorities = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ error: 'Priority must be Low, Medium, or High' });
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      priority,
      status: 'Open',
      authorId: req.user.userId
    },
    include: { author: true }
  });

  res.status(201).json(ticket);
});

/**
 * GET /api/tickets
 * Retrieve tickets (role-based filtering)
 * - Employees: See only their own tickets
 * - Admins: See all tickets
 * Requires: Authentication
 */
app.get('/api/tickets', authenticate, async (req, res) => {
  if (req.user.role === 'Employee') {
    const tickets = await prisma.ticket.findMany({
      where: { authorId: req.user.userId },
      include: { author: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(tickets);
  }

  const tickets = await prisma.ticket.findMany({
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(tickets);
});

app.get('/api/reports/resolutions', authenticate, authorizeRole('Admin'), async (req, res) => {
  const { from, to } = req.query;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const parseDate = (value) => {
    if (typeof value !== 'string' || !datePattern.test(value)) {
      return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
  };
  const fromDate = parseDate(from);
  const toDate = parseDate(to);

  if (!fromDate || !toDate || fromDate > toDate) {
    return res.status(400).json({ error: 'Provide a valid date range with from on or before to' });
  }

  const toExclusive = new Date(toDate);
  toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);

  const resolutions = await prisma.ticketResolution.findMany({
    where: { resolvedAt: { gte: fromDate, lt: toExclusive } },
    include: { ticket: { include: { author: { select: { name: true } } } } },
    orderBy: { resolvedAt: 'desc' }
  });
  const durations = resolutions.map((resolution) => resolution.resolutionSeconds).sort((a, b) => a - b);
  const middle = Math.floor(durations.length / 2);
  const medianResolutionSeconds = durations.length === 0
    ? null
    : durations.length % 2 === 0
      ? Math.round((durations[middle - 1] + durations[middle]) / 2)
      : durations[middle];

  res.json({
    from,
    to,
    total: resolutions.length,
    averageResolutionSeconds: durations.length
      ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
      : null,
    medianResolutionSeconds,
    resolutions
  });
});

/**
 * PUT /api/tickets/:id
 * Update ticket status (Admins only)
 * Requires: Authentication, Admin role
 * 
 * Params: { id: ticket ID }
 * Body: { status: "Open|In Progress|Resolved" }
 * Response: Updated ticket object
 */
app.put('/api/tickets/:id', authenticate, authorizeRole('Admin'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Open', 'InProgress', 'Resolved'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be Open, InProgress, or Resolved' });
  }

  const ticket = await prisma.$transaction(async (transaction) => {
    const existing = await transaction.ticket.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return null;
    }

    const updated = await transaction.ticket.update({
      where: { id: req.params.id },
      data: { status },
      include: { author: true }
    });

    if (status === 'Resolved' && existing.status !== 'Resolved') {
      const resolvedAt = new Date();
      const resolutionSeconds = Math.max(0, Math.round((resolvedAt.getTime() - existing.createdAt.getTime()) / 1000));
      await transaction.ticketResolution.create({
        data: { ticketId: existing.id, resolvedAt, resolutionSeconds }
      });
    }

    return updated;
  });

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  res.json(ticket);
});

// ==================== Production Configuration ====================

/**
 * In production, serve the built React frontend as static files
 * Fall back to index.html for SPA routing
 */
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'frontend', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

// ==================== Server Initialization ====================

/**
 * Start the server: Seed database with default users, then listen for requests
 */
seedUsers()
  .then(({ employee }) => seedDemoTickets(employee))
  .then(() => {
    app.listen(port, () => {
      console.log(`DeskFlow server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exit(1);
  });
