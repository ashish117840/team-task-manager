# Team Task Manager

This repository contains a full-stack Team Task Manager application (MongoDB, Express, React, Node — M.E.R.N).

## Assignment Brief

Assignment: Team Task Manager (Full-Stack)

Build a web app where users can create projects, assign tasks, and track progress with role-based access (Admin/Member).

### Key Features

- Authentication (Signup/Login)
- Project and team management
- Task creation, assignment & status tracking
- Dashboard with tasks, status, and overdue tracking

## Live deployments

- **Frontend (Vercel)**: https://team-task-manager-sepia-iota.vercel.app/
- **Backend (Railway)**: https://team-task-manager-production-2b4c.up.railway.app/

> If you land on an older backend URL (for example `...-5b27.up.railway.app`) update the Vercel `VITE_API_URL` environment variable and redeploy the frontend so it points to the `2b4c` backend.

## Quick start — Backend

1. Install dependencies and start:

```powershell
cd backend
npm install
node server.js
```

2. Required environment variables (set in `.env` or your host):
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JWT signing secret
- `FRONTEND_URL` (optional) — canonical frontend origin to whitelist for CORS

3. Optional: seed 6 demo projects with realistic tasks:

```powershell
cd backend
npm run seed:demo
```

Demo accounts after seeding:
- `demo.admin@taskmanager.local` / `DemoPass123!`
- `aarav.member@taskmanager.local` / `DemoPass123!`

The backend listens on the port in `PORT` (default 5000).

## Quick start — Frontend

1. Install dependencies and start dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Environment variable for production builds:
- `VITE_API_URL` — e.g. `https://team-task-manager-production-2b4c.up.railway.app/api`

The `frontend/vite.config.js` contains a `server.proxy` entry so local `/api` calls are proxied to the `VITE_API_URL` target during development to avoid CORS issues.

## CORS notes

- The backend currently whitelists `http://localhost:5173`, the `FRONTEND_URL` env var (if provided), and Vercel origins `*.vercel.app`.
- If you see browser errors like `No 'Access-Control-Allow-Origin' header is present`, ensure both:
  - The backend has been redeployed with the updated `server.js` (CORS changes), and
  - The frontend deployment's `VITE_API_URL` points to the same backend you intend to use.

## Where to look

- Backend server entry: `backend/server.js`
- Frontend API client: `frontend/src/api/axios.js`
- Frontend dev config: `frontend/vite.config.js`

---
If you want, I can:
- Verify the Vercel `VITE_API_URL` value and trigger a redeploy (you'll need to do this in the Vercel dashboard), or
- Run the curl preflight tests once you confirm redeploys are complete.
