const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'deskflow-secret';

app.use(cors());
app.use(express.json());

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function createToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' });
}

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

function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Only ${role} users can access this endpoint` });
    }
    next();
  };
}

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DeskFlow API is running' });
});

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

app.put('/api/tickets/:id', authenticate, authorizeRole('Admin'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Open', 'In Progress', 'Resolved'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be Open, In Progress, or Resolved' });
  }

  const ticket = await prisma.ticket.update({
    where: { id: req.params.id },
    data: { status },
    include: { author: true }
  });

  res.json(ticket);
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, '..', 'frontend', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'dist', 'index.html'));
  });
}

seedUsers()
  .then(() => {
    app.listen(port, () => {
      console.log(`DeskFlow server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exit(1);
  });
