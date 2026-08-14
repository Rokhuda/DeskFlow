# DeskFlow

DeskFlow is a lightweight internal IT service portal designed for small teams to report and track IT issues. It provides a simple React frontend and an Express backend with a SQLite database managed by Prisma.

What the program can do

- Employee login and authentication (JWT-based demo auth)
- Create and submit service tickets with title, description and priority
- View personal tickets (employees) or all tickets (admins)
- Admin dashboard to update ticket status (Open, InProgress, Resolved)
- Role-based access control (Employee vs Admin)
- OpenAPI/Swagger documentation available at /api-docs
- Seeds demo accounts on first run for quick testing

Quick run (development)

Prerequisites
- Node.js 20+ and npm
- Git

1. Install root dependencies:

   npm install

2. Install frontend dependencies:

   npm --prefix frontend install

3. Create the SQLite database and apply Prisma migrations:

   npm run prisma:migrate

   This creates prisma/dev.db and the Prisma client.

4. Start backend and frontend together:

   npm run dev

5. Open the app in your browser:

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API docs (Swagger): http://localhost:5000/api-docs

Demo accounts (seeded automatically on first run)

- Employee: employee@deskflow.local / password123
- Admin: admin@deskflow.local / password123

Notes

- If you need to reset the local DB, remove prisma/dev.db and re-run 
pm run prisma:migrate.
- Keep secrets out of source control: place local secrets in a .env file (ignored by .gitignore).
