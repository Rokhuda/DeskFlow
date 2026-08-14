# DeskFlow

DeskFlow is a lightweight internal IT service portal with a React frontend and an Express API backed by SQLite via Prisma.

## Features

- Employee login and ticket submission
- Admin dashboard with status updates
- OpenAPI documentation at /api-docs
- JWT-based authentication for demo users
- SQLite database with Prisma migrations

## Prerequisites

- Node.js 20+
- npm
- Git

## Quick start

1. Install root dependencies:
   
> deskflow@1.0.0 postinstall
> npm run prisma:generate


> deskflow@1.0.0 prisma:generate
> prisma generate --schema=prisma/schema.prisma

Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 229ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate


up to date, audited 187 packages in 5s

37 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

2. Install frontend dependencies:
   
up to date, audited 89 packages in 1s

13 packages are looking for funding
  run `npm fund` for details

2 vulnerabilities (1 moderate, 1 high)

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

3. Create the SQLite database and apply the Prisma schema:
   
> deskflow@1.0.0 prisma:migrate
> prisma migrate dev --schema=prisma/schema.prisma --name init

Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

Already in sync, no schema change or pending migration was found.

Running generate... (Use --skip-generate to skip the generators)
[2K[1A[2K[GRunning generate... - Prisma Client
[2K[1A[2K[G✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 164ms

4. Start the backend and frontend together:
   
> deskflow@1.0.0 dev
> concurrently -n backend,frontend -c blue,green "npm run dev:backend" "npm run dev:frontend"

[backend] 
[backend] > deskflow@1.0.0 dev:backend
[backend] > node backend/server.js
[backend] 
[frontend] 
[frontend] > deskflow@1.0.0 dev:frontend
[frontend] > npm --prefix frontend run dev -- --host 0.0.0.0
[frontend] 
[frontend] 
[frontend] > deskflow-frontend@1.0.0 dev
[frontend] > vite --host 0.0.0.0
[frontend] 
[frontend] Port 5173 is in use, trying another one...
[frontend] Port 5174 is in use, trying another one...
[frontend] 
[frontend]   VITE v5.4.21  ready in 329 ms
[frontend] 
[frontend]   ➜  Local:   http://localhost:5175/
[frontend]   ➜  Network: http://10.255.255.254:5175/
[frontend]   ➜  Network: http://172.22.61.115:5175/
[backend] node:events:502
[backend]       throw er; // Unhandled 'error' event
[backend]       ^
[backend] 
[backend] Error: listen EADDRINUSE: address already in use :::5000
[backend]     at Server.setupListenHandle [as _listen2] (node:net:1908:16)
[backend]     at listenInCluster (node:net:1965:12)
[backend]     at Server.listen (node:net:2067:7)
[backend]     at Function.listen (/home/rokhu/technical/projects/DeskFlow/node_modules/express/lib/application.js:635:24)
[backend]     at /home/rokhu/technical/projects/DeskFlow/backend/server.js:273:9
[backend] Emitted 'error' event on Server instance at:
[backend]     at emitErrorNT (node:net:1944:8)
[backend]     at process.processTicksAndRejections (node:internal/process/task_queues:82:21) {
[backend]   code: 'EADDRINUSE',
[backend]   errno: -98,
[backend]   syscall: 'listen',
[backend]   address: '::',
[backend]   port: 5000
[backend] }
[backend] 
[backend] Node.js v20.20.2
[backend] npm run dev:backend exited with code 1
[frontend] Terminated
[frontend] npm run dev:frontend exited with code SIGTERM

5. Open the app:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Swagger docs: http://localhost:5000/api-docs

## Demo accounts

The app seeds two users automatically:

- Employee: employee@deskflow.local / password123
- Admin: dmin@deskflow.local / password123

## Environment

A .env file is included at the project root with the following defaults:

SHELL=/bin/bash
WSL2_GUI_APPS_ENABLED=1
WSL_DISTRO_NAME=Ubuntu
NAME=ROKHUDA
PWD=/home/rokhu/technical/projects/DeskFlow
LOGNAME=rokhu
HOME=/home/rokhu
LANG=C.UTF-8
WSL_INTEROP=/run/WSL/137344_interop
WAYLAND_DISPLAY=wayland-0
TERM=xterm-256color
USER=rokhu
DISPLAY=:0
SHLVL=1
XDG_RUNTIME_DIR=/run/user/1000/
WSLENV=ELECTRON_RUN_AS_NODE/w:
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/wsl/lib:/mnt/c/Program Files/WindowsApps/MicrosoftCorporationII.WindowsSubsystemForLinux_2.4.12.0_x64__8wekyb3d8bbwe:/mnt/c/WINDOWS/system32:/mnt/c/WINDOWS:/mnt/c/WINDOWS/System32/Wbem:/mnt/c/WINDOWS/System32/WindowsPowerShell/v1.0/:/mnt/c/WINDOWS/System32/OpenSSH/:/mnt/c/Program Files/Git/cmd:/mnt/c/Program Files/Microsoft SQL Server/150/Tools/Binn/:/mnt/c/Program Files/Microsoft SQL Server/Client SDK/ODBC/170/Tools/Binn/:/mnt/c/Program Files/dotnet/:/mnt/c/Program Files (x86)/Windows Kits/10/Windows Performance Toolkit/:/mnt/c/Program Files/nodejs/:/mnt/c/Users/rokhu/AppData/Local/Microsoft/WindowsApps:/mnt/c/Users/rokhu/.dotnet/tools:/mnt/c/Users/rokhu/AppData/Local/Programs/Microsoft VS Code/bin:/mnt/c/Users/rokhu/AppData/Local/Python/bin:/mnt/c/Users/rokhu/AppData/Roaming/npm
DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus
HOSTTYPE=x86_64
PULSE_SERVER=unix:/mnt/wslg/PulseServer
_=/usr/bin/env

If you are starting from a fresh checkout and the file is missing, create it before running the app.

## Production build

To build the frontend for production:


> deskflow@1.0.0 build
> npm --prefix frontend run build


> deskflow-frontend@1.0.0 build
> vite build

vite v5.4.21 building for production...
transforming...
✓ 84 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.39 kB │ gzip:  0.26 kB
dist/assets/index-D0oO7BMb.css    2.33 kB │ gzip:  0.97 kB
dist/assets/index-B5sihawB.js   197.24 kB │ gzip: 65.86 kB
✓ built in 2.69s

To run the backend in production mode with the built frontend:


> deskflow@1.0.0 start
> node backend/server.js

## Troubleshooting

- If Prisma errors appear, regenerate the client:
  
> deskflow@1.0.0 prisma:generate
> prisma generate --schema=prisma/schema.prisma

Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 301ms

Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)

Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
- If the database is out of sync, reset it and rerun migrations:
  
> deskflow@1.0.0 prisma:migrate
> prisma migrate dev --schema=prisma/schema.prisma --name init

Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

Already in sync, no schema change or pending migration was found.

Running generate... (Use --skip-generate to skip the generators)
[2K[1A[2K[GRunning generate... - Prisma Client
[2K[1A[2K[G✔ Generated Prisma Client (v6.19.3) to ./node_modules/@prisma/client in 221ms
