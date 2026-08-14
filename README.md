# DeskFlow — Run instructions

Minimal steps to run the application locally for development.

Prerequisites
- Node.js 20+ and npm
- Git

Local run (development)
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
- Keep secrets out of source control: place local secrets in a .env file (not committed).
