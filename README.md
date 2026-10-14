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

Railway is the current deployment target. It can run the Express server and built React app as one service. For this demo, SQLite must live on a Railway volume, and the service must run as a single replica.

1. Push the project to GitHub and create a Railway project from the repository.
2. In the service settings, set the root directory to `/`.
3. Set the build command to:

   ```sh
   npm --prefix frontend ci && npm run build
   ```

   Railway installs the root dependencies and generates the Prisma client during installation.

4. Set the start command to:

   ```sh
   npm run start:deploy
   ```

   This applies pending Prisma migrations at startup, then starts the API and serves the frontend.

5. Add a Railway volume to this service and set its mount path to `/data`.
6. Set these service variables:

   | Variable | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `file:/data/deskflow.db` |
   | `JWT_SECRET` | A unique random secret of at least 32 characters |

   Generate a secret locally with `openssl rand -base64 48`; paste it directly into Railway's variable settings, not into Git or chat.

7. Generate a Railway public domain and deploy. Verify the service at `/api/health`, then sign in using the demo buttons.

The volume is required because Railway's application filesystem is temporary. SQLite on one volume is suitable for a portfolio/demo deployment, not multiple replicas or production workloads. The app seeds publicly known demo accounts with a shared password and does not hash passwords, so **do not use real or private user data**. Production also refuses to start with a missing or short JWT secret.

Netlify can host a static frontend, but this Express app would need to be hosted separately or adapted to serverless functions. Railway is simpler for the current one-service design.

To build the frontend locally, run `npm run build`.
