# DeskFlow

DeskFlow is a demo IT service desk for small teams. Employees can submit requests and track progress; administrators can manage the queue and review resolution reports.

## Screenshots

<p align="center">
  <img src="screenshots/sign-in.jpg" width="32%" alt="DeskFlow sign-in screen" />
  <img src="screenshots/employee-dashboard.jpg" width="32%" alt="Employee dashboard with a request form and sample tickets" />
</p>
<p align="center">
  <img src="screenshots/admin-dashboard.jpg" width="48%" alt="Administrator ticket queue" />
  <img src="screenshots/resolution-report.jpg" width="48%" alt="Resolution report with closure details and elapsed resolution times" />
</p>

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, JavaScript, Vite 5, Axios |
| Backend | Node.js, Express 4 |
| Database and ORM | SQLite for local demos, Prisma 6 |
| Authentication | JSON Web Tokens (JWT), role-based access |
| API documentation | Swagger UI and OpenAPI |
| Styling | CSS |

## Features

- Employee sign-in, request submission, and personal request tracking.
- Admin ticket queue with status updates and request filters.
- Resolution report with a selectable closure date range, elapsed resolution times, average and median durations, and CSV export.
- Demo accounts and sample tickets in development.

## Run locally

Prerequisites: Node.js 20+ and npm.

```sh
npm install
npm --prefix frontend install
cp .env.example .env
npm run prisma:migrate
npm run dev
```

Open the app at [http://localhost:5173](http://localhost:5173). The API runs at [http://localhost:5000](http://localhost:5000); its health check is `/api/health` and Swagger UI is at `/api-docs`.

Use the **Employee view** or **Admin view** demo button on the sign-in screen. Both use the demo password `password123`.

## Reports and historical data

Administrators can open **Reports** and choose the period by resolution date. Resolution time is elapsed calendar time from ticket creation to each time it was marked Resolved. Each closure is recorded separately, so a ticket that is later reopened retains its earlier closure in reports.

Closure history begins when this feature is installed. Older resolved tickets without a recorded closure date are not included.

## Deployment

Netlify can host the built React frontend. Netlify Functions can also run an API, but this Express server is not currently adapted or configured for serverless deployment. The simplest Netlify setup is to host the API on a Node application host and use a managed database, then configure the frontend API URL and backend CORS for the deployed site.

For a small demo, a Node application host such as Render or Railway is a more direct fit because it can run the API and serve the built frontend together. SQLite needs persistent disk storage and a single application instance; for multiple instances or production use, move to managed PostgreSQL.

This repository does **not** currently include a verified Netlify or one-click cloud deployment configuration. Treat the existing Docker/Kubernetes files as unverified legacy scaffolding. Before exposing the app publicly, remove demo-account seeding from production, replace plain-text demo passwords with secure password hashing and real account management, and set a strong `JWT_SECRET`. Do not put real user data in the demo deployment.

To build the frontend locally, run `npm run build`.
