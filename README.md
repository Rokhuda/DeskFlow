# DeskFlow

DeskFlow is a lightweight internal IT service portal with a React frontend and an Express backend backed by SQLite through Prisma.

## Features

- Employee login and ticket submission
- Admin dashboard with status updates
- OpenAPI documentation at `/api-docs`
- Mock JWT-based authentication

## Run locally

1. Install dependencies: `npm install`
2. Create the database schema: `npm run prisma:migrate`
3. Start the app: `npm run dev`

The frontend runs at http://localhost:5173 and the backend at http://localhost:5000.
