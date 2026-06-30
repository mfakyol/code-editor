# CodePen Clone

A full-stack, CodePen-style online code editor. Write HTML, CSS and JavaScript
(with preprocessor support) in a multi-pane editor, see a live sandboxed
preview, then save, fork, share, embed and discover pens — backed by real
authentication and a social layer (likes & comments).

> **Status:** feature-complete. 60 automated tests (44 backend, 16 frontend),
> all green. CI/CD and deployment are the remaining steps.

<!-- Add a live demo link and screenshots/GIF here once deployed:
## Live Demo
https://your-deployment-url

## Screenshots
![Editor](docs/editor.png)
![Explore](docs/explore.png)
-->

---

## Features

### Editor & live preview
- **Three-pane editor** (HTML / CSS / JS) powered by CodeMirror 6, with
  resizable panels and `top` / `left` / `right` layouts.
- **Live preview** rendered in a sandboxed `<iframe>`, with a captured
  **console** panel and an interactive **REPL** input.
- **Preprocessors**, compiled server-side:
  - HTML: Pug, Markdown, Haml
  - CSS: Sass, SCSS, Less, Stylus
  - JS: TypeScript, CoffeeScript, Babel (JSX)
- **External resources**: attach CDN scripts and stylesheets per pen.
- **Code formatting** (Prettier), adjustable font size, editor themes
  (Dracula / GitHub Dark / GitHub Light), auto-run toggle, and keyboard
  shortcuts (`Ctrl/Cmd+S` save, `Ctrl/Cmd+Enter` run, `Shift+Alt+F` format).
- **Drafts**: unsaved work is autosaved to `localStorage` for guests.

### Pens, sharing & social
- **Auth**: register / login / logout with session cookies, plus password
  change. Passwords are hashed with bcrypt.
- **Save & fork** pens; **public / private** visibility.
- **Share links** and **embeddable iframes** (`/embed/:id`).
- **Read-only full view** (`/pen/:id/full`) with the running preview,
  **likes**, and a **comments** thread.
- **Explore gallery** (`/explore`) with live thumbnails, sorted by recent or
  most-liked.
- **User profiles** (`/u/:username`) listing a user's public pens.
- Loading **skeletons** throughout for a polished feel.

### Security
- **Pug templates** are rendered inside a locked-down `node:vm` context with a
  hard timeout — arbitrary template JS can't reach `process`/`require`.
- The preview **iframe is sandboxed** (`allow-scripts`, no same-origin), so
  user code runs in an isolated origin.
- The CPU-heavy **`/api/compile` endpoint is rate-limited** (60 req/min per IP).
- `httpOnly`, `sameSite` session cookies; CORS locked to the client origin.

---

## Tech Stack

**Frontend** — React 19, Vite 8, TypeScript, Tailwind CSS v4, React Router 7,
CodeMirror 6 (`@uiw/react-codemirror`), `react-resizable-panels`, Prettier,
Tabler Icons.

**Backend** — Node.js, Express 5, MongoDB + Mongoose 9, Passport (local
strategy) with `express-session` + `connect-mongo`, bcryptjs. Preprocessors:
`sass`, `less`, `stylus`, `pug`, `marked`, `haml`, `typescript`,
`coffeescript`, `@babel/core`.

**Testing** — Vitest on both sides; `supertest` + `mongodb-memory-server`
(backend integration tests), Testing Library + jsdom (frontend).

---

## Architecture

```
┌──────────────────────────┐         ┌───────────────────────────┐
│        Client (Vite)     │         │       Server (Express)    │
│                          │  /api   │                           │
│  React 19 + CodeMirror   │ ──────▶ │  Auth (Passport/session)  │
│  Live preview (iframe)   │  proxy  │  Pen CRUD / fork / social │
│  Explore / Profile / …   │ ◀────── │  Preprocessor compile API │
└──────────────────────────┘         │            │              │
                                      │            ▼              │
                                      │     MongoDB (Mongoose)    │
                                      └───────────────────────────┘
```

Preview flow: the client compiles a pen (calling `/api/compile` only when a
preprocessor is selected), assembles a full HTML document, and renders it in a
sandboxed iframe. The injected bootstrap script forwards `console.*` output and
runtime errors to the parent via `postMessage`.

### Project structure

```
code-editor/
├── client/                 # React + Vite front end
│   └── src/
│       ├── components/      # Editor, Preview, PenCard, Skeleton, …
│       ├── contexts/        # Auth, Workspace, PenSettings, PreviewRunner
│       ├── hooks/           # usePreview, useCompiledDoc, useMediaQuery
│       ├── pages/           # Editor, Explore, Profile, Account, PenView, …
│       ├── utils/           # buildSrcDoc, compileCode, draft, formatCode
│       └── config/api.ts    # typed API client
└── server/                 # Express + Mongoose back end
    └── src/
        ├── compilers/       # html / css / js preprocessor compilers
        ├── controllers/     # auth, pen, social, user, compile
        ├── middleware/      # requireAuth, rateLimit, validation, errors
        ├── models/          # User, Pen, Like, Comment
        ├── routes/          # auth, pens, users, compile
        └── services/        # compile orchestration
```

---

## Getting Started

### Prerequisites
- **Node.js** 20+
- **MongoDB** — run a local instance, use Docker, or point at MongoDB Atlas.

Quick MongoDB via Docker:

```bash
docker run -d --name codepen-mongo -p 27017:27017 mongo:7
```

### 1. Backend

```bash
cd server
cp .env.example .env        # then edit as needed
npm install
npm run dev                 # starts on http://localhost:3001
```

`.env` keys:

```ini
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/codepen-clone
SESSION_SECRET=change-me-to-a-long-random-secret
```

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # starts on http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so no extra config is
needed for local development.

---

## Available Scripts

| Location | Command            | Description                          |
| -------- | ------------------ | ------------------------------------ |
| server   | `npm run dev`      | Start API with hot reload (tsx)      |
| server   | `npm start`        | Start API                            |
| server   | `npm run typecheck`| Type-check with `tsc`                |
| server   | `npm test`         | Run backend tests (Vitest)           |
| client   | `npm run dev`      | Start Vite dev server                |
| client   | `npm run build`    | Type-check + production build        |
| client   | `npm run preview`  | Preview the production build         |
| client   | `npm run lint`     | Run ESLint                           |
| client   | `npm test`         | Run frontend tests (Vitest)          |

---

## Testing

```bash
cd server && npm test     # 44 integration tests (supertest + in-memory Mongo)
cd client && npm test     # 16 unit/component tests (Testing Library + jsdom)
```

Backend tests spin up an isolated **`mongodb-memory-server`** instance (the
binary is downloaded once and cached), so they need no running database.
Coverage includes auth, pen CRUD and access control, fork, likes, comments,
the compile endpoint, the rate limiter, user profiles, and password change.

---

## API Reference

Base URL: `/api`. Endpoints marked 🔒 require an authenticated session.

### Auth
| Method | Path                    | Description                  |
| ------ | ----------------------- | ---------------------------- |
| POST   | `/auth/register`        | Create an account & log in   |
| POST   | `/auth/login`           | Log in                       |
| POST   | `/auth/logout`          | Log out                      |
| GET    | `/auth/me`              | Current user (or `null`)     |
| POST   | `/auth/change-password` | 🔒 Change password           |

### Pens
| Method | Path                          | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/pens/public?sort=recent`    | Public gallery (`recent` / `popular`)|
| GET    | `/pens/:id`                   | Get a pen (public or owned)          |
| GET    | `/pens/:id/comments`          | List a pen's comments                |
| GET    | `/pens`                       | 🔒 List your pens                     |
| POST   | `/pens`                       | 🔒 Create a pen                       |
| POST   | `/pens/:id/fork`              | 🔒 Fork a pen                         |
| PUT    | `/pens/:id`                   | 🔒 Update your pen                    |
| DELETE | `/pens/:id`                   | 🔒 Delete your pen                    |
| POST   | `/pens/:id/like`              | 🔒 Toggle like                        |
| POST   | `/pens/:id/comments`          | 🔒 Add a comment                      |
| DELETE | `/pens/:id/comments/:cid`     | 🔒 Delete a comment (author or owner)|

### Users & compile
| Method | Path                | Description                              |
| ------ | ------------------- | ---------------------------------------- |
| GET    | `/users/:username`  | Public profile + the user's public pens  |
| POST   | `/compile`          | Compile preprocessors (rate-limited)     |

---

## License

ISC. This project was built as a portfolio piece.
