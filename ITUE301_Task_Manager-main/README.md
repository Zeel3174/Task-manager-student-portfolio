# ITUE301 Task Manager — Practicals 1 to 10

**Course:** Advanced Web Development Frameworks (ITUE301)
**University:** Charotar University of Science and Technology (CHARUSAT), Faculty of Technology and Engineering, B.Tech (IT/CE/CSE/AIML)

A single monorepo that grows from a static React portfolio (Practical 1) into a full-stack, authenticated, cached, event-driven Task Management application (Practical 10).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [API Reference](#api-reference)
6. [Frontend Routes](#frontend-routes)
7. [Practical 1 — React and Component Architecture](#practical-1--introduction-to-react-and-component-architecture)
8. [Practical 2 — State Management and Routing](#practical-2--state-management-and-routing-in-react)
9. [Practical 3 — API Integration and Data Rendering](#practical-3--api-integration-and-data-rendering-in-react)
10. [Practical 4 — RESTful API with Node.js and Express](#practical-4--building-a-restful-api-with-nodejs-and-express)
11. [Practical 5 — MongoDB and Mongoose](#practical-5--mongodb-integration-and-schema-design-with-mongoose)
12. [Practical 6 — Full Stack Integration](#practical-6--full-stack-integration-react--node--mongodb)
13. [Practical 7 — Authentication and Middleware Pipeline](#practical-7--authentication-and-middleware-pipeline)
14. [Practical 8 — Performance Optimization and Lazy Loading](#practical-8--performance-optimization-and-lazy-loading-in-react)
15. [Practical 9 — In-Memory Caching](#practical-9--in-memory-caching-and-query-optimization)
16. [Practical 10 — Event-Driven Architecture](#practical-10--asynchronous-processing-with-event-driven-architecture)
17. [Testing and CI](#testing-and-ci)
18. [Practical-wise Status Summary](#practical-wise-status-summary)
19. [Security Notes](#security-notes)
20. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router (`react-router-dom`) |
| Backend | Node.js (v18+), Express |
| Database | MongoDB (Atlas or local) with Mongoose ODM |
| Auth | JWT (`jsonwebtoken`) and password hashing (`bcryptjs`) |
| Caching | `node-cache` (in-process memory) |
| Async | Node.js native `EventEmitter` |
| Testing / CI | Jest, Supertest, GitHub Actions |

---

## Project Structure

```
ITUE301_Task_Manager/
├── .github/workflows/ci.yml      # CI: install + run backend tests
├── .env.example                  # Placeholder env file (no real secrets)
├── .gitignore
├── package.json                  # Root helper scripts
├── README.md
│
├── backend/
│   ├── server.js                 # App setup, middleware order, DB connect
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   └── taskRoutes.js         # /tasks/* (protected)
│   ├── controllers/
│   │   ├── authController.js     # register, login, me
│   │   └── taskController.js     # CRUD + cache + events
│   ├── middleware/
│   │   ├── requestLogger.js      # Logs timestamp, method, URL
│   │   ├── auth.js               # Verifies JWT
│   │   ├── validateTask.js       # Server-side input validation
│   │   └── errorHandler.js       # Global error handler (last)
│   ├── models/
│   │   ├── Task.js               # Task schema
│   │   └── User.js               # User schema
│   ├── cache/cache.js            # node-cache instance (TTL 60s)
│   ├── events/
│   │   ├── eventBus.js           # Shared EventEmitter
│   │   └── taskEvents.js         # Listeners (task-created / task-deleted / error)
│   ├── __tests__/health.test.js  # Jest + Supertest test
│   └── jest.config.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx              # BrowserRouter + AuthProvider
        ├── App.jsx               # Routes + lazy loading + Suspense
        ├── styles.css
        ├── api/taskApi.js        # Central API client (BASE_URL)
        ├── context/AuthContext.jsx
        ├── components/           # Header, About, Skills, Footer, NavBar
        └── pages/                # Home, Tasks, Projects, Contact, Login, Register
```

---

## Getting Started

### Prerequisites
- Node.js v18 or newer, and npm (`node -v`, `npm -v`)
- A MongoDB database (local install, or a free MongoDB Atlas cluster)
- Visual Studio Code, Postman or Thunder Client, a modern browser

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ITUE301_Task_Manager
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```
Edit `backend/.env` with your own values (see [Environment Variables](#environment-variables)), then:
```bash
npm start
```
Expected output:
```
Task event handlers registered
MongoDB connected
Backend running on http://localhost:5000
```

### 3. Frontend setup (second terminal)
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173**.

> Both servers must run at the same time: React on **5173**, Express on **5000**.

### Root helper scripts
| Command | Action |
|---|---|
| `npm run backend` | Start the backend |
| `npm run frontend` | Start the frontend dev server |
| `npm run frontend:build` | Production build of the frontend |
| `npm test` | Run backend tests |

---

## Environment Variables

Create `backend/.env` (never commit it):

```env
PORT=5000
MONGO_URI=mongodb+srv://<db_user>:<db_password>@<cluster-host>/<db_name>?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_string
```

| Variable | Used by | Purpose |
|---|---|---|
| `PORT` | `server.js` | Port Express listens on (default 5000) |
| `MONGO_URI` | `server.js` | MongoDB connection string |
| `JWT_SECRET` | `authController.js`, `auth.js` | Secret used to sign and verify JWTs. **Required for login and every `/tasks` route** |

Optional (frontend): `VITE_API_URL` overrides the default backend URL `http://localhost:5000` in `frontend/src/api/taskApi.js`.

---

## API Reference

Base URL: `http://localhost:5000`

### Public
| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/` | API status | `200` |
| POST | `/api/auth/register` | Register `{ email, password }` | `201` |
| POST | `/api/auth/login` | Login, returns `{ token, user }` | `200` |

### Protected (header `Authorization: Bearer <token>`)
| Method | Endpoint | Description | Success |
|---|---|---|---|
| GET | `/api/auth/me` | Current user (password excluded) | `200` |
| GET | `/tasks` | List all tasks (newest first, cached) | `200` |
| GET | `/tasks/:id` | Get one task (cached) | `200` / `404` |
| POST | `/tasks` | Create task `{ title, description }` | `201` |
| PUT | `/tasks/:id` | Update task | `200` / `404` |
| DELETE | `/tasks/:id` | Delete task | `200` / `404` |

Common error responses: `400` (validation), `401` (missing/invalid/expired token or bad credentials), `404` (task not found), `409` (user already exists), `500` (unexpected error).

### Task model
| Field | Type | Notes |
|---|---|---|
| `title` | String | required, trimmed |
| `description` | String | default `''` |
| `completed` | Boolean | default `false` |
| `assignedTo` | ObjectId (User) | set automatically from the logged-in user |
| `createdAt`, `updatedAt` | Date | added by Mongoose `timestamps` |

---

## Frontend Routes

| Path | Component | Loaded |
|---|---|---|
| `/` | `Home` (Header, About, Skills, Footer) | Eager |
| `/tasks` | `Tasks` (full CRUD, needs login) | Eager |
| `/projects` | `Projects` (GitHub repos) | Lazy |
| `/contact` | `Contact` (controlled input) | Lazy |
| `/login` | `Login` | Lazy |
| `/register` | `Register` | Lazy |
| `*` | 404 message | Eager |

---

# Practicals

---

## Practical 1 — Introduction to React and Component Architecture

**CO/PO:** CO1 / PO3, PO5

### Objective
Set up a React development environment using Vite and build a static UI from independent, reusable components.

### What was built
A student-portfolio style home page composed of four reusable components.

```
Home.jsx
 ├── Header.jsx   (receives `name` prop)
 ├── About.jsx    (short bio text)
 ├── Skills.jsx   (receives `skillList` prop, renders a list)
 └── Footer.jsx   (course / university info)
```

| File | Role |
|---|---|
| `src/components/Header.jsx` | Site title and welcome line using the `name` prop |
| `src/components/About.jsx` | Short description of the project |
| `src/components/Skills.jsx` | Maps over the `skillList` array and renders `<li key={skill}>` items |
| `src/components/Footer.jsx` | Footer text |
| `src/components/NavBar.jsx` | Navigation using `NavLink`, which adds an `active` class to the current route (covers the "highlight active section" supplementary task) |
| `src/pages/Home.jsx` | Composes the four components; passes `skillList` to `Skills` |
| `src/App.jsx` | Passes `name="ITUE301 Student"` into `Home`, which forwards it to `Header` |

### Key concepts demonstrated
- **JSX** with embedded JavaScript expressions (`{name}`, `{skillList.map(...)}`).
- **Functional components** that return markup.
- **Props** carrying data from parent to child: `name` into `Header` and `skillList` into `Skills` (two components, as required).
- **Reusability and one-responsibility-per-component:** no JSX is duplicated across components.

### How to run and verify
```bash
node -v && npm -v
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`. The Home page shows the header, about card, skills list and footer. The browser console should show no errors.

### Key questions (viva notes)
- **Role of each component:** Header = identity, About = description, Skills = dynamic list, Footer = closing info; App/Home compose them.
- **How React re-renders on prop change:** when a parent passes a new prop value, React re-runs the child function and updates only the DOM nodes that changed (via reconciliation).
- **Why reusability matters at scale:** less duplicated code, one place to fix a bug, consistent UI, easier testing.

### Supplementary tasks
| Task | Status |
|---|---|
| NavBar highlighting active section | Done (`NavLink` active class) |
| Skills array passed as prop and rendered dynamically | Done |
| Theme-colour prop on Header with inline style | Not implemented (easy extension: `<header style={{ background: themeColor }}>`) |

### Common mistakes avoided
Putting all UI in `App.jsx`; hardcoding values instead of using props; forgetting `key` in list rendering.

---

## Practical 2 — State Management and Routing in React

**CO/PO:** CO1 / PO3, PO5

### Objective
Add reactive state with `useState` and multi-page navigation with React Router v6 to the existing app.

### What was built
```
main.jsx → <BrowserRouter> → <AuthProvider> → <App />
App.jsx
 ├── <NavBar />                     (NavLink for every route)
 └── <Routes>
      ├── "/"          → Home
      ├── "/tasks"     → Tasks
      ├── "/projects"  → Projects
      ├── "/contact"   → Contact   (controlled input + toggle state)
      ├── "/login"     → Login
      ├── "/register"  → Register
      └── "*"          → 404 page
```

### Key implementation details
- **`BrowserRouter` wraps the app once**, in `main.jsx`.
- **`NavLink` (not `<a>`)** is used for navigation, so clicking a link never reloads the page.
- **Contact page (`src/pages/Contact.jsx`) uses two `useState` variables:**
  - `name`: a *controlled input* (`value={name}` + `onChange`) that echoes what the user types.
  - `show`: toggles visibility of a greeting message via a button.
- **404 route:** `path="*"` renders "404 - Page not found" for unknown URLs.

### How to run and verify
1. Start the frontend and click through Home, Tasks, Projects, Contact, Login, Register.
2. Open DevTools → Network tab: switching routes should not trigger a full document reload.
3. On `/contact`, type a name and press **Toggle message**; the greeting appears and updates live.
4. Visit `/anything-random` to see the 404 message.

### Key questions (viva notes)
- **Why state instead of props for form input?** Props are read-only and come from a parent; state is owned by the component and triggers a re-render when it changes.
- **Link vs `<a>`:** `Link`/`NavLink` change the URL through the History API and let React swap components; `<a href>` makes the browser request a new page.
- **Why order routes specific → general?** So `*` (catch-all) does not shadow real routes.

### Supplementary tasks
| Task | Status |
|---|---|
| 404 Not Found route | Done |
| Dark/light mode toggle with `useState` | Not implemented |
| Live character count under Contact input | Not implemented |

---

## Practical 3 — API Integration and Data Rendering in React

**CO/PO:** CO1 / PO3, PO5

### Objective
Consume a public REST API and handle asynchronous data with loading and error states.

### What was built
`src/pages/Projects.jsx` fetches the author's public GitHub repositories:

```
Projects.jsx
 ├── useState: data, loading, error
 ├── useEffect(() => fetch(...), [])      → runs once on mount
 ├── loading → "Loading projects..."
 ├── error   → error card with message
 └── success → grid of repo cards (name + "Open repository" link to html_url)
```

API used: `https://api.github.com/users/Zeel3174/repos` (public, no authentication needed).
**To use your own account**, change the username in that URL.

### Key implementation details
- The empty dependency array `[]` makes the fetch run **once on mount**, which prevents an infinite request loop.
- `.finally(() => setLoading(false))` guarantees the loading state ends on both success and failure.
- A non-OK HTTP response is converted to an error (`throw new Error('GitHub API request failed')`), so it is shown in the UI instead of breaking rendering.
- The component is **lazy loaded** (see Practical 8).

### How to run and verify
- **Happy path:** open `/projects`; after a brief "Loading projects..." message the repository cards appear.
- **Error path:** temporarily change the URL to something invalid (e.g. a non-existent username) and confirm the error card shows instead of a blank page.
- Check the Network tab for exactly one request to `api.github.com`.

### Key questions (viva notes)
- **Why `useEffect`?** Fetching is a side effect. Calling `fetch` in the component body would run on every render and, since it sets state, trigger a re-render loop.
- **Loading vs error state:** loading means "in progress, no result yet"; error means "finished, but failed". They need different UI and must be handled separately.
- **Without them:** users would see a blank screen or a crash with no explanation.

### Supplementary tasks
| Task | Status |
|---|---|
| Retry button on error | Not implemented |
| Search input to filter repos | Not implemented |
| Star count next to repo name | Not implemented (`r.stargazers_count` is available in the response) |

> The loading indicator is a text message rather than a dedicated `<Spinner />` component.

---

## Practical 4 — Building a RESTful API with Node.js and Express

**CO/PO:** CO2 / PO3, PO5

### Objective
Design a RESTful backend with complete CRUD endpoints and an Express middleware pipeline.

### Request pipeline (`backend/server.js`)
```
Client (Postman / Browser)
   │
   ▼
cors()  →  express.json()  →  requestLogger
   │
   ▼
Routers:  /  ·  /api/auth/*  ·  /tasks/*
   │
   ▼
errorHandler  (registered last)
```

### Middleware
| File | What it does |
|---|---|
| `middleware/requestLogger.js` | Logs `[ISO timestamp] METHOD URL` for every request, then calls `next()` |
| `middleware/errorHandler.js` | Global handler `(err, req, res, next)`: logs only `err.message` on the server and returns `{ message }` JSON with status `err.statusCode` or `500`. **No stack trace is sent to the client.** |
| `express.json()` | Parses JSON bodies so `req.body` is defined on POST/PUT |

### REST endpoints (`routes/taskRoutes.js` + `controllers/taskController.js`)
| Method | Path | Controller | Status codes |
|---|---|---|---|
| GET | `/tasks` | `getTasks` | 200 |
| GET | `/tasks/:id` | `getTask` | 200, 404 |
| POST | `/tasks` | `createTask` | 201 |
| PUT | `/tasks/:id` | `updateTask` | 200, 404 |
| DELETE | `/tasks/:id` | `deleteTask` | 200, 404 |

Every controller wraps its logic in `try/catch` and forwards failures with `next(e)` to the global handler.

> **Note:** the lab sheet starts with an in-memory array; in this repository the controllers use MongoDB directly (the Practical 5 step), so no in-memory version is kept.

### How to test (Postman / Thunder Client)
1. Register and log in (Practical 7) to obtain a token. All `/tasks` routes require `Authorization: Bearer <token>`.
2. `POST /tasks` with `{ "title": "Learn Express", "description": "Practical 4" }` → `201`.
3. `GET /tasks` → `200` with the array.
4. `PUT /tasks/<id>` with `{ "title": "Learn Express", "completed": true }` → `200`.
5. `DELETE /tasks/<id>` → `200`; repeating it → `404`.
6. Watch the server terminal: each request prints a log line.

### Key questions (viva notes)
- **Why must the error handler be last?** Express runs middleware in registration order; an error handler only catches errors from middleware/routes registered *before* it.
- **`app.use()` vs route-specific middleware:** `app.use()` applies to every request (e.g. logger); route-level middleware (e.g. `validateTask`) applies only where attached.
- **Why not send stack traces?** They reveal file paths, library versions and logic that help attackers.

### Supplementary tasks
| Task | Status |
|---|---|
| Reject POST/PUT without `Content-Type: application/json` | Not implemented |
| Route-specific task-ID format validation | Not implemented |
| JSON 404 handler for undefined routes | Not implemented (Express default response is used) |

---

## Practical 5 — MongoDB Integration and Schema Design with Mongoose

**CO/PO:** CO2, CO3 / PO3, PO5

### Objective
Connect Express to MongoDB and enforce data rules through Mongoose schemas.

### Architecture
```
Express App → Mongoose ODM → MongoDB → tasks collection
{ title, description, completed, assignedTo, createdAt, updatedAt }
```

### Implementation
- **Connection (`server.js`):** `mongoose.connect(process.env.MONGO_URI)`. The server starts listening only after the DB connects; on failure it prints the error and exits.
- **Credentials live in `.env`** (loaded by `dotenv`), never in code.
- **Task schema (`models/Task.js`):**

| Field | Definition |
|---|---|
| `title` | `String`, `required: true`, `trim: true` |
| `description` | `String`, default `''` |
| `completed` | `Boolean`, default `false` |
| `assignedTo` | `ObjectId` ref `User`, default `null` |
| timestamps | `{ timestamps: true }` creates `createdAt` / `updatedAt` automatically |

- **Mongoose methods used:** `Task.find().sort({ createdAt: -1 })`, `Task.findById`, `Task.create`, `Task.findByIdAndUpdate(..., { new: true, runValidators: true })`, `Task.findByIdAndDelete`.
- `runValidators: true` ensures validation also applies to **updates**, not just creates.
- `GET /tasks/:id` returns `404 { message: 'Task not found' }` when the ID does not exist.

### How to verify
1. Create tasks via Postman, then restart the server and call `GET /tasks` again. The data persists.
2. Open MongoDB Compass or the Atlas web UI to see documents in the `tasks` collection.
3. Send `POST /tasks` with an empty title → `400 { "message": "title is required" }`.

### Key questions (viva notes)
- **Why a schema if MongoDB is schema-less?** The database accepts anything; Mongoose enforces structure at the application layer so bad data never reaches storage.
- **Why validate server-side?** Frontend validation can be bypassed (Postman, curl, edited JS).
- **What happens on validation failure?** Mongoose throws a `ValidationError` before the write; the controller's `catch` calls `next(err)` and the request ends at the global error handler.

### Supplementary tasks
| Task | Status |
|---|---|
| `priority` enum (`low`/`medium`/`high`) | Not implemented |
| Trim whitespace on title | Done (via `trim: true`, equivalent effect to a pre-save hook) |
| `GET /tasks/:id` with 404 JSON | Done |

---

## Practical 6 — Full Stack Integration (React + Node + MongoDB)

**CO/PO:** CO1, CO2 / PO3, PO5

### Objective
Connect the React frontend to the Express/MongoDB backend as a fully working application.

### Architecture
```
React (localhost:5173)
   │  fetch + Authorization header
   ▼
Express (localhost:5000)
   │  Mongoose
   ▼
MongoDB

Flow: UI form → POST /tasks → MongoDB → UI re-fetches → updated list
```

### Implementation
- **CORS:** `app.use(cors())` in `server.js` allows the dev server on port 5173 to call the API on 5000.
- **Central API client (`src/api/taskApi.js`):** a single `BASE_URL` (default `http://localhost:5000`, overridable via `VITE_API_URL`) and one `request()` helper that sets JSON headers, parses the response and throws an `Error(data.message)` when `res.ok` is false. It exposes `getTasks`, `createTask`, `updateTask`, `deleteTask`, `register`, `login`.
- **Tasks page (`src/pages/Tasks.jsx`):**
  - Loads tasks on mount and whenever the token changes.
  - **Create:** form (title + description) → `POST` → clear form → re-fetch.
  - **Update:** *Toggle* button flips `completed` via `PUT` → re-fetch.
  - **Delete:** asks `confirm('Delete this task?')` first, then `DELETE` → re-fetch.
  - Shows `Loading...` and an error message line for failures of any operation.
- **State sync:** the UI re-fetches after every successful write rather than assuming success.

### How to run and verify
1. Terminal 1: `cd backend && npm start`.
2. Terminal 2: `cd frontend && npm run dev`.
3. Register, log in, open `/tasks`, then create → toggle → delete a task.
4. **Refresh the browser.** Data remains because it is stored in MongoDB.
5. Stop the backend and try an action to see the error message appear.

### Key questions (viva notes)
- **Why CORS?** Browsers block requests between different origins (5173 vs 5000) unless the server opts in.
- **Why re-fetch after writes?** The server is the source of truth. Re-fetching guarantees the UI reflects what was actually saved.
- **Risk of ignoring write errors:** the user thinks data was saved when it was not.

### Supplementary tasks
| Task | Status |
|---|---|
| Confirmation dialog before delete | Done |
| Optimistic UI for create | Not implemented |
| Toast notifications | Not implemented (errors are shown inline) |

---

## Practical 7 — Authentication and Middleware Pipeline

**CO/PO:** CO2, CO6 / PO3, PO5

### Objective
Implement JWT-based authentication and server-side input validation.

### Flow
```
POST /api/auth/register → validate → hash password (bcrypt) → save User → 201
POST /api/auth/login    → find user → bcrypt.compare → sign JWT (1h) → { token, user }

Protected request
  Authorization: Bearer <token>
        │
        ▼
  [auth middleware]  verify JWT → req.user = decoded payload
        │
        ▼
  [validateTask]     title must exist and be non-blank (POST / PUT)
        │
        ▼
  Controller
```

### Implementation
| File | Details |
|---|---|
| `models/User.js` | `email` (required, unique, lowercase, trimmed) and hashed `password` |
| `controllers/authController.js` | `register`: requires email and password (`400`), rejects duplicates (`409`), hashes with `bcrypt.hash(password, 10)`, returns `201` without the password. `login`: returns `401 Invalid credentials` for unknown email or wrong password (same message for both, avoiding user enumeration), signs `{ id, email }` with `JWT_SECRET`, `expiresIn: '1h'`. `me`: returns the user without the password field |
| `middleware/auth.js` | Reads the `Bearer` token; missing → `401 Authentication required`; invalid/expired → `401 Invalid or expired token` (`jwt.verify` is inside `try/catch`, so a bad token cannot crash the server) |
| `middleware/validateTask.js` | Rejects blank/missing `title` with `400` before the controller or database is reached |
| `routes/taskRoutes.js` | `router.use(auth)` protects **every** task route |
| `context/AuthContext.jsx` | Stores the token in `localStorage`, exposes `token`, `login(t)`, `logout()` |
| `pages/Login.jsx`, `Register.jsx` | Forms calling the auth API; login saves the token and redirects to `/tasks` |
| `pages/Tasks.jsx` | Shows "Please login first" when there is no token |

### How to test in Postman
1. `POST /api/auth/register` `{ "email": "a@b.com", "password": "secret123" }` → `201`.
2. `POST /api/auth/login` with the same body → copy the `token`.
3. `GET /api/auth/me` with header `Authorization: Bearer <token>` → user details.
4. `GET /tasks` **without** the header → `401`; with the header → `200`.
5. `POST /tasks` with `{ "title": "" }` → `400 title is required`.

### Key questions (viva notes)
- **Why hash passwords?** A database leak must not expose usable passwords. bcrypt is deliberately slow and adds a random salt automatically.
- **What does the auth middleware verify?** The token's signature (made with `JWT_SECRET`) and that it has not expired; on failure the request is stopped with `401`.
- **Why validate on the server?** The frontend can be bypassed; the server is the last line of defence.

### Supplementary tasks
| Task | Status |
|---|---|
| `/me` endpoint | Done |
| Logout mechanism | `logout()` exists in `AuthContext` (clears the token) but no logout button is wired in the NavBar yet |
| Frontend redirect to login on 401 | Not implemented |

---

## Practical 8 — Performance Optimization and Lazy Loading in React

**CO/PO:** CO1 / PO3, PO5

### Objective
Reduce the initial bundle size using route-based code splitting.

### Implementation (`src/App.jsx`)
```jsx
const Projects = lazy(() => import('./pages/Projects'));
const Contact  = lazy(() => import('./pages/Contact'));
const Login    = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

<Suspense fallback={<div className="card">Loading page...</div>}>
  <Routes> ... </Routes>
</Suspense>
```
- `Suspense` wraps **only the `Routes` block**, so the navigation bar stays visible while a chunk loads.
- `Home` and `Tasks` stay in the main bundle (needed immediately / core feature).
- Each lazy page uses `export default`, which `React.lazy` requires.

### Build output (from `npm run build`)
Separate chunks are generated for each lazy route:

```
dist/assets/index-<hash>.js      main bundle
dist/assets/Contact-<hash>.js    lazy chunk
dist/assets/Projects-<hash>.js   lazy chunk
dist/assets/Login-<hash>.js      lazy chunk
dist/assets/Register-<hash>.js   lazy chunk
```

### Before/after measurement — record from your own run
Capture the **baseline before** making routes lazy (temporarily use normal imports), then the optimized result.

| Metric | Before (no lazy) | After (lazy) |
|---|---|---|
| Main bundle size (`npm run build`) | _fill in_ | _fill in_ |
| Number of JS files | _fill in_ | _fill in_ |
| JS transferred on first load (Network tab) | _fill in_ | _fill in_ |
| Load time (DevTools, Slow 3G) | _fill in_ | _fill in_ |

Add screenshots to a `docs/` folder and link them here.

### How to observe the lazy loading
1. Run `npm run build` and read the chunk list in the terminal.
2. `npm run dev`, open DevTools → Network → set throttling to **Slow 3G** → click *Projects*.
3. The "Loading page..." fallback appears, then the chunk downloads and the page renders.

### Key questions (viva notes)
- **Initial bundle vs lazy chunk:** the initial bundle downloads on first visit; a lazy chunk downloads only when its route is first opened.
- **Why faster if total code is the same?** The user gets a usable first screen sooner because less JavaScript must be downloaded and parsed up front.
- **When not worth it:** very small apps, where extra requests and complexity outweigh savings.

### Supplementary tasks
| Task | Status |
|---|---|
| Lazy load a heavy third-party component | Not implemented |
| Minimum-delay fallback (300 ms) | Not implemented |
| React DevTools Profiler re-render note | To be documented by the student |

---

## Practical 9 — In-Memory Caching and Query Optimization

**CO/PO:** CO2, CO4 / PO3, PO5

### Objective
Add server-side caching and measure its effect on response time.

### Design
```
GET /tasks
   │
   ▼
cache.get('all_tasks')
   ├── HIT  → return cached data (header X-Cache: HIT)
   └── MISS → Task.find() → cache.set('all_tasks') → return (X-Cache: MISS)

POST / PUT / DELETE /tasks
   │
   ▼
Write to MongoDB → invalidate cache keys
```

### Implementation
- **`cache/cache.js`:** `new NodeCache({ stdTTL: 60, checkperiod: 120 })` — entries expire after **60 seconds**, expired keys are swept every 120 seconds.
- **Cache keys:** `all_tasks` for the list, `task_<id>` for a single task (so `GET /tasks/:id` is cached **separately**, which also completes that supplementary task).
- **Invalidation (`invalidate()` in `taskController.js`):** deletes `all_tasks` and, when an ID is known, `task_<id>`. It runs after every successful create, update and delete, so stale data is never served.
- **`X-Cache: HIT | MISS` response header:** makes it easy to confirm in Postman whether a response came from the cache.

### How to measure (Postman / Thunder Client)
1. **Uncached baseline first:** temporarily comment out the `cache.get(...)` check in `getTasks`, restart, send `GET /tasks` three times and record the *Time* value.
2. **Cached:** restore the code, restart, send `GET /tasks` three times. The first request is a MISS; the next two are HITs.
3. Record the readings below.

| Reading | Without cache (ms) | With cache (ms) |
|---|---|---|
| 1 | _fill in_ | _fill in_ (MISS) |
| 2 | _fill in_ | _fill in_ (HIT) |
| 3 | _fill in_ | _fill in_ (HIT) |
| **Average** | _fill in_ | _fill in_ |

> Measurements must come from your own machine. If the difference is small, add more task documents so the database query takes longer.

### Key questions (viva notes)
- **Why invalidate on writes?** Otherwise users would see old data until the TTL expires, breaking correctness.
- **TTL trade-off:** a longer TTL gives better performance but staler data; a shorter TTL gives fresher data with more database hits. 60 seconds is a reasonable lab/task-app value.
- **Why is `node-cache` unsuitable for multiple servers?** The cache lives in one process's memory. Each instance would have its own copy, and a write on one instance would not invalidate the others (a shared store such as Redis solves this). The cache is also lost on restart.

### Supplementary tasks
| Task | Status |
|---|---|
| Cache `GET /tasks/:id` separately | Done |
| Hit/miss counter debug endpoint | Not implemented (the `X-Cache` header offers per-request visibility) |
| TTL experiments | To be documented by the student |

---

## Practical 10 — Asynchronous Processing with Event-Driven Architecture

**CO/PO:** CO4 / PO3, PO5

### Objective
Use Node's built-in `EventEmitter` to run side effects in the background without blocking the API response.

### Flow
```
POST /tasks
   │
   ▼
Task.create → invalidate cache
   │
   ▼
console.log("[API] Response sent at <time>")
res.status(201).json(task)          ← client gets the response here
   │
   ▼
taskEvents.emit('task-created', task)
   │  (listener runs afterwards)
   ▼
[EVENT HANDLER] Notification completed at <later time> | task="..." | assignedUser="..."
```

### Implementation
| File | Details |
|---|---|
| `events/eventBus.js` | Exports a single shared `EventEmitter` instance |
| `events/taskEvents.js` | `registerTaskEvents()` (guarded so it registers once, called from `server.js`) attaches three listeners |
| `controllers/taskController.js` | `createTask` logs the response timestamp, sends `201`, **then** emits `task-created`; `deleteTask` sends the response, **then** emits `task-deleted` |

Listeners:
- **`task-created`:** waits **2 seconds** (simulated slow work), then logs the task title, timestamp and assigned user ID.
- **`task-deleted`:** logs `Task deleted: <title>`.
- **`error`:** logs any emitted error so an unhandled `error` event can't crash the process.

### Expected console evidence
```
[API] Response sent at 2026-01-01T10:00:00.120Z
[EVENT HANDLER] Notification completed at 2026-01-01T10:00:02.125Z | task="Demo" | assignedUser="665f..."
```
(Times are illustrative; capture a screenshot of your own run.) The API timestamp appears about 2 seconds **before** the handler's completion timestamp, even though Postman received the `201` immediately. That gap is the proof of non-blocking behavior.

### How to verify
1. Start the backend and open its terminal.
2. `POST /tasks` in Postman; note the response arrives immediately.
3. Watch the terminal: the `[API]` line appears first, the `[EVENT HANDLER]` line about 2 seconds later.
4. `DELETE /tasks/<id>` and look for the `Task deleted` log.

### Key questions (viva notes)
- **Why doesn't `emit` block the response?** The response is already sent before `emit` is called, and the listener's `await` (timer) yields control back to the event loop, so other requests keep being served.
- **What if the logic sat inside the POST route?** The 2-second delay would be added to every create request, so the client would wait.
- **Why not for millions of events/day?** `EventEmitter` is in-memory, single-process, has no persistence, retries or delivery guarantees; events vanish if the process crashes. Use a queue (RabbitMQ, Bull/Redis, Kafka) at that scale.

### Supplementary tasks
| Task | Status |
|---|---|
| `task-deleted` event with its own listener | Done |
| `error` event listener | Done |
| Slow handler (2 s) while API still responds instantly | Done (`setTimeout` of 2000 ms) |

---

## Testing and CI

**Backend test** (`backend/__tests__/health.test.js`) uses Jest and Supertest to check that `GET /` returns `200` and a message containing `Task Manager API`. It imports the Express app without connecting to MongoDB, so it runs anywhere.

```bash
cd backend
npm test
```

**CI** (`.github/workflows/ci.yml`) runs on every push and pull request: checkout → set up Node 20 → `npm --prefix backend install` → `npm --prefix backend test`. A green check on GitHub means the tests passed.

---

## Practical-wise Status Summary

| # | Practical | Core requirements | Supplementary |
|---|---|---|---|
| 1 | React + Components | Complete | NavBar active link, dynamic skills done; theme prop not done |
| 2 | State + Routing | Complete | 404 done; dark mode and character count not done |
| 3 | API Integration | Complete (loading + error states) | Retry, search, star count not done |
| 4 | Express REST API | Complete | Content-Type check, ID validation, JSON 404 not done |
| 5 | MongoDB + Mongoose | Complete | Trim and `GET /:id` 404 done; priority enum not done |
| 6 | Full Stack | Complete | Delete confirmation done; optimistic UI and toast not done |
| 7 | JWT Auth | Complete | `/me` done; logout button and 401 redirect not done |
| 8 | Lazy Loading | Complete (4 lazy routes) | Measurements to be recorded by the student |
| 9 | Caching | Complete (TTL 60s, invalidation) | Per-task cache done; hit/miss counter not done; timings to be recorded |
| 10 | Events | Complete | All three supplementary items done; screenshot to be captured |

---

## Security Notes

- **Never commit `.env`.** It is ignored through `.gitignore`; `.env.example` must contain placeholders only.
- **Rotate any credential that was ever committed or shared** (for example a MongoDB Atlas database user password), because it remains in Git history and in shared copies of the project.
- **`JWT_SECRET` must be set** in `backend/.env`; without it login and every protected route fail. Use a long random value, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- Passwords are stored only as bcrypt hashes.
- The frontend keeps the JWT in `localStorage` (acceptable for coursework; `httpOnly` cookies are safer for production).
- In Atlas, add your IP address under *Network Access*, or the connection will time out.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `MongoDB connection failed` / timeout | Wrong `MONGO_URI` or IP not whitelisted | Check `.env`; whitelist your IP in Atlas |
| Login fails or `/tasks` always `401` | `JWT_SECRET` missing or `Authorization: Bearer <token>` header malformed | Set `JWT_SECRET`; keep the space after `Bearer` |
| CORS error in the browser console | Backend not running or wrong port | Start backend on 5000; `cors()` is enabled in `server.js` |
| `fetch failed` / Network Error in UI | Backend server not started | Run the backend in a separate terminal |
| Port 5173 / 5000 already in use | Old process still running | Stop it, or `npm run dev -- --port 5174` |
| Stale tasks after an edit | Cache not invalidated | Confirm writes call `invalidate()` |
| No `[EVENT HANDLER]` log | Listeners not registered | Ensure `registerTaskEvents()` is called in `server.js` |
| `Element type is invalid` after lazy import | Component not a default export | Use `export default` |
| Fallback never visible | Chunk loads too fast locally | Throttle to *Slow 3G* in DevTools |
| `npm create vite` hangs | Network/proxy issue | Retry on a stable network |

---

## Author

Prepared for **ITUE301 — Advanced Web Development Frameworks**, CHARUSAT.
Replace this line with your name, roll number and repository link before submission.
