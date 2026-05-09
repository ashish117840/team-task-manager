# Team Task Manager

A modern, full-stack web application for managing team projects and tasks. Built with React, Express, and MongoDB, Team Task Manager enables teams to organize work, assign tasks, track progress, and collaborate efficiently with role-based access control.

## 🌐 Live Demo

- **Frontend**: https://team-task-manager-sepia-iota.vercel.app/
- **Backend API**: https://team-task-manager-9onk.onrender.com/

**Demo Accounts** (after seeding demo data):

| Email | Password | Role |
|-------|----------|------|
| `aarav.member@taskmanager.local` | `TMdemo-2026!` | Member |
| `siya.member@taskmanager.local` | `TMdemo-2026!` | Member |
| `vivaan.member@taskmanager.local` | `TMdemo-2026!` | Member |
| `anaya.member@taskmanager.local` | `TMdemo-2026!` | Member |

## ✨ Core Features

**Authentication & Authorization**  
Secure signup and login with JWT tokens. Role-based access control distinguishes between Admin users (who can create projects and manage members) and Member users (who are assigned tasks and can update their progress).

**Project Management**  
Create and organize projects with team members. Admins can invite members to projects and manage the team roster. Each project maintains its own member list and task board.

**Task Workflow**  
Create tasks within projects and assign them to team members. Track task status with three states—To Do, In Progress, and Done. Update task details and completion status in real-time with a visual kanban board view.

**Dashboard & Progress Tracking**  
See a bird's-eye view of all your activity: total tasks, counts by status, overdue items, and recent activity feed. The dashboard automatically pulls data based on your role and project access.

**Overdue Tracking**  
Never miss a deadline. The dashboard highlights tasks past their due date, and you can see all overdue items at a glance across all projects.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite, Axios, Context API |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas (Mongoose ORM) |
| **Authentication** | JWT + bcrypt |
| **Deployment** | Vercel (frontend), Render (backend) |

## 🚀 Quick Start

### Backend (Node.js + Express)

```bash
cd backend
npm install
node server.js
```

The backend will start on port 5000 (or your configured `PORT` env var) and connect to MongoDB Atlas.

**Environment Variables** (create a `.env` file):

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/database`) |
| `JWT_SECRET` | ✅ | Secret key for signing JWT tokens (any secure string, e.g., `MySecretKey123`) |
| `FRONTEND_URL` | ⚠️ | Frontend origin for CORS (e.g., `https://team-task-manager-sepia-iota.vercel.app`). If omitted, localhost:5173 and `*.vercel.app` are allowed. |
| `PORT` | ❌ | Server port (default: 5000) |

**Test the Backend:**
```bash
curl https://team-task-manager-production-2b4c.up.railway.app/
# Response: { "message": "API running ✅" }
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173`. Vite is configured to proxy `/api` calls to your backend during development.

**Environment Variables** (for production builds):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g., `https://team-task-manager-production-2b4c.up.railway.app/api`) |

## 🌱 Seed Demo Data

Populate the database with 6 sample projects and 18 realistic tasks for testing:

```bash
cd backend
npm run seed:demo
```

**Demo Admin Account:**
- Email: `helloashish20@gmail.com`
- Password: `Ashish@7000`

**Demo Member Accounts:**
- `aarav.member@taskmanager.local` / `TMdemo-2026!`
- `siya.member@taskmanager.local` / `TMdemo-2026!`
- `vivaan.member@taskmanager.local` / `TMdemo-2026!`
- `anaya.member@taskmanager.local` / `TMdemo-2026!`

## 📊 Project Structure

```
backend/
  ├── server.js              # Express app setup, CORS, routes
  ├── seedDemoData.js        # Demo data seeding script
  ├── controllers/           # Business logic (auth, projects, tasks)
  ├── models/                # Mongoose schemas (User, Project, Task)
  ├── routes/                # API endpoints
  ├── middleware/            # Auth verification
  └── utils/                 # Helpers (validation)

frontend/
  ├── vite.config.js         # Dev server, API proxy config
  ├── src/
  │   ├── pages/             # Dashboard, Projects, MyTasks, ProjectDetail, Auth
  │   ├── components/        # Navbar, TaskCard, PrivateRoute
  │   ├── context/           # AuthProvider (JWT, user state)
  │   ├── api/               # axios instance, API calls
  │   └── App.jsx, main.jsx  # Router, entry point
```

## 🔐 Security & CORS

The backend CORS policy whitelists:
- `http://localhost:5173` (local development)
- The `FRONTEND_URL` environment variable (production)
- All `*.vercel.app` origins (Vercel deployments)

If you see **CORS errors** in the browser console:
1. Ensure the `VITE_API_URL` in your frontend environment points to the correct backend
2. Verify the backend has been redeployed with the correct `FRONTEND_URL` set
3. Check that your frontend origin matches one of the whitelisted patterns above

## 🚢 Deployment

### Backend → Railway

1. Push code to GitHub
2. Connect your GitHub repo to [Railway](https://railway.app)
3. Set environment variables in Railway dashboard:
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET` (secure random string)
   - `FRONTEND_URL` (your Vercel frontend URL)
4. Railway auto-deploys on push to main

### Frontend → Vercel

1. Push code to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Set build environment variables:
   - `VITE_API_URL` (your Railway backend URL + `/api`)
4. Vercel auto-builds and deploys on push to main

## 📚 API Overview

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/auth/signup` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login and get JWT |
| `POST` | `/api/projects` | ✅ | Create project (admin only) |
| `GET` | `/api/projects` | ✅ | List user's projects |
| `GET` | `/api/projects/:id` | ✅ | Get project details |
| `POST` | `/api/projects/:id/members` | ✅ | Add member to project |
| `POST` | `/api/tasks` | ✅ | Create task in project |
| `GET` | `/api/tasks` | ✅ | List user's tasks |
| `PATCH` | `/api/tasks/:id` | ✅ | Update task status/details |
| `DELETE` | `/api/tasks/:id` | ✅ | Delete task (admin only) |
| `GET` | `/api/tasks/dashboard/stats` | ✅ | Dashboard summary stats |

## 💡 How It Works

1. **User Signs Up** → System creates a user account with a role (Admin/Member)
2. **Admin Creates Project** → Initializes a project and can invite team members
3. **Admin Assigns Tasks** → Creates tasks within the project and assigns to members
4. **Members Update Progress** → View assigned tasks and update status (To Do → In Progress → Done)
5. **Dashboard Shows Overview** → Real-time stats, overdue alerts, and activity feed

## 🐛 Troubleshooting

**Backend won't start / MongoDB connection fails**
- Verify your `MONGO_URI` is correct (check MongoDB Atlas connection string)
- Ensure your IP is whitelisted in MongoDB Atlas Network Access
- The backend includes DNS fallback (8.8.8.8, 1.1.1.1) for SRV record resolution issues

**Frontend can't reach backend**
- Verify `VITE_API_URL` environment variable is set correctly in your deployment platform
- Check that backend `FRONTEND_URL` includes your frontend's domain in CORS whitelist
- In development, Vite proxies `/api` calls automatically—check `frontend/vite.config.js`

**Seed data won't run**
- Ensure MongoDB is running and accessible
- Check that `MONGO_URI` has proper credentials
- Try: `node backend/seedDemoData.js` (runs the script directly for better error output)

**Tasks showing "Access denied"**
- Verify you're logged in and have the right role for the project
- Project owners can see all tasks in their projects
- Members can only see tasks assigned to them

## 📞 Support & Contributing

This project was built as a demonstration of full-stack MERN architecture with role-based access control, real-time task management, and cloud deployment best practices.

For questions or improvements, please review the code structure and reach out with specific issues.
