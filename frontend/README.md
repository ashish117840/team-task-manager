# Team Task Manager — Frontend

This frontend powers the Team Task Manager dashboard, project board, and task workflow screens.

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

Both links are the current production endpoints; the frontend reads the backend base URL from `VITE_API_URL`. During local development the Vite dev server proxies `/api` to the backend.

## Local development

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start dev server (Vite):

```bash
npm run dev
```

3. Environment variables

- `VITE_API_URL` — set this in your `.env` or in Vercel dashboard. Example (production):

	```text
	VITE_API_URL=https://team-task-manager-production-2b4c.up.railway.app/api
	```

The local `vite.config.js` contains a dev `server.proxy` for `/api` which forwards requests to `VITE_API_URL` when present.

## Production notes

- The Vercel deployment must have `VITE_API_URL` set to the production Railway backend URL before triggering a build so the compiled frontend communicates with the correct API.
- If you see browser CORS errors (no `Access-Control-Allow-Origin`), confirm that the backend was redeployed with the updated CORS whitelist and that `FRONTEND_URL` (or the backend's allowed origins) includes your Vercel URL.

## Project structure

- `src/` — React source files
- `src/api/axios.js` — Axios instance that reads `import.meta.env.VITE_API_URL`
- `vite.config.js` — Vite config with a dev proxy for `/api`

## Contact

If you want, I can also:

- Verify Vercel `VITE_API_URL` and trigger a redeploy.
- Run curl preflight checks for the backend once you confirm the backend redeploy is complete.
