# DeskFlow

DeskFlow is a lightweight internal IT service portal with a React frontend and an Express backend backed by SQLite through Prisma ORM.

## Features

- 👤 Employee login and ticket submission
- 🔧 Admin dashboard with ticket status management
- 📚 OpenAPI/Swagger documentation at `/api-docs`
- 🔐 JWT-based authentication with role-based access control
- 🐳 Docker containerization for easy deployment
- ☸️ Kubernetes manifests for cloud-native deployment
- 💾 Prisma ORM for type-safe database access

## Technology Stack

- **Frontend**: React 18, Vite, Axios
- **Backend**: Express.js, Node.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Docs**: Swagger/OpenAPI 3.0
- **Container**: Docker, Kubernetes ready

## Quick Start - Local Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Install root dependencies:
   ```bash
   npm install
   ```

3. Create the database schema:
   ```bash
   npm run prisma:migrate
   ```

4. Start the development server (both frontend and backend):
   ```bash
   npm run dev
   ```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

### Demo Credentials

- **Employee**: employee@deskflow.local / password123
- **Admin**: admin@deskflow.local / password123

## Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build frontend for production
npm run build

# Run Prisma database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

## Project Structure

```
DeskFlow/
├── backend/              # Express.js API server
│   ├── server.js        # Main application file
│   └── package.json
├── frontend/            # React SPA
│   ├── src/
│   │   ├── App.jsx      # Main component
│   │   ├── main.jsx     # Entry point
│   │   └── styles.css   # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── prisma/              # Database schema
│   └── schema.prisma
├── k8s/                 # Kubernetes manifests
│   ├── README.md        # K8s deployment guide
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── configmap.yaml
│   └── secret-template.yaml
├── Dockerfile.backend   # Backend container image
├── Dockerfile.frontend  # Frontend container image
├── nginx.conf          # Nginx configuration for frontend
└── package.json        # Root package configuration
```

## Docker Deployment

### Build Docker Images

```bash
# Build backend image
docker build -f Dockerfile.backend -t deskflow-backend:latest .

# Build frontend image
docker build -f Dockerfile.frontend -t deskflow-frontend:latest .
```

### Run with Docker Compose

```bash
docker-compose up
```

## Kubernetes Deployment

For production deployment on Kubernetes, see the [Kubernetes README](./k8s/README.md) for detailed instructions.

### Quick Deploy

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=deskflow
```

## Why Prisma Instead of MongoDB?

### Prisma Advantages (Used in DeskFlow)

1. **Type Safety**: Prisma provides auto-generated TypeScript types based on your schema, preventing runtime errors
2. **Database Agnostic**: Easy to switch between SQLite, PostgreSQL, MySQL, MariaDB, or SQL Server
3. **Developer Experience**: 
   - Auto-completion and type hints in IDEs
   - Intuitive query builder (no complex query syntax)
   - Better for structured data with relations
4. **Schema Versioning**: Migrations are tracked and reversible
5. **Performance**: SQL databases are better for relational data and complex queries
6. **Simpler for IT Portal**: The structured nature of tickets, users, and statuses fits SQL perfectly
7. **Cost**: SQLite (no server), PostgreSQL (cheaper than MongoDB hosting)
8. **ACID Compliance**: Strong data consistency for critical business operations

### When MongoDB Would Be Better

- Highly unstructured data or frequent schema changes
- Horizontal scaling needs (though Prisma works with distributed SQL)
- Document-oriented workflows
- Rapid prototyping without schema design

### Trade-offs in DeskFlow

| Aspect | Prisma + SQL | MongoDB |
|--------|-------------|---------|
| Type Safety | ✅ Excellent | ❌ Manual |
| Relationships | ✅ Native joins | ⚠️ Denormalization |
| Query Complexity | ✅ SQL powerful | ⚠️ Aggregation pipeline |
| Learning Curve | ✅ Familiar SQL | ⚠️ NoSQL concepts |
| Data Consistency | ✅ ACID | ⚠️ Eventual consistency |
| Flexibility | ⚠️ Schema required | ✅ Schema-less |
| Scalability | ✅ Vertical + read replicas | ✅ Native horizontal |

**Conclusion**: For DeskFlow, a structured internal IT portal, Prisma with SQLite/PostgreSQL is the better choice for reliability, type safety, and cost-effectiveness.

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your-secret-key-here

# Database
DATABASE_URL="file:./prisma/dev.db"

# For production with PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/deskflow"
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Tickets
- `GET /api/tickets` - Get tickets (filtered by role)
- `POST /api/tickets` - Create new ticket (Employee)
- `PUT /api/tickets/:id` - Update ticket status (Admin)

### Health
- `GET /api/health` - Server health check

## Security Considerations

⚠️ **This is a demo application. For production:**

1. Use strong, unique JWT secrets
2. Hash passwords with bcrypt (not stored plaintext)
3. Use HTTPS/TLS encryption
4. Implement rate limiting
5. Add input validation and sanitization
6. Use environment variables for secrets
7. Enable CORS properly
8. Consider implementing 2FA
9. Add audit logging
10. Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning or as a starting point for your own IT portal.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

