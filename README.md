# Code Editor

A CodePen-style online playground for HTML, CSS, and JavaScript. Write code in a
multi-pane editor with preprocessor support, see an instant sandboxed preview,
then save, fork, share, and discover pens — backed by real authentication and a
likes & comments layer.

**Live demo:** [codeeditor.fatihakyol.com](https://codeeditor.fatihakyol.com/)

## Features

**Editor & preview**
- Three-pane HTML / CSS / JS editor (CodeMirror 6) with resizable, rearrangeable panels
- Live preview in a sandboxed `<iframe>`, with a captured console panel and a JS REPL
- Server-side preprocessors — Pug / Markdown / Haml, Sass / SCSS / Less / Stylus, TypeScript / CoffeeScript / Babel (JSX)
- External CDN scripts & styles per pen, Prettier formatting, editor themes, and keyboard shortcuts
- Guest drafts autosaved to `localStorage`

**Sharing & social**
- Session-based auth (register / login, bcrypt-hashed passwords)
- Save, fork, and public / private pens
- Shareable links, embeddable iframes (`/embed/:id`), and a read-only full view
- Explore gallery with live thumbnails, user profiles, likes, and comments

**Security**
- Preview iframe sandboxed (no same-origin) — user code runs in an isolated origin
- Pug / Haml compiled inside a `node:vm` context with a hard timeout
- Rate limiting on auth (brute-force) and the compile endpoint
- Zod-validated input, `httpOnly` / `sameSite` cookies, CORS locked to the client origin

## Tech Stack

- **Frontend** — React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7, CodeMirror 6, Zustand
- **Backend** — Node.js, Express 5, MongoDB + Mongoose, Passport (session), Zod
- **Testing** — Vitest, Supertest, and `mongodb-memory-server` (backend)

## Getting Started

**Prerequisites:** Node.js 20+ and MongoDB (local, Docker, or Atlas).

```bash
# Optional: MongoDB via Docker
docker run -d --name codepen-mongo -p 27017:27017 mongo:7
```

**Backend**

```bash
cd server
cp .env.example .env      # edit if needed
npm install
npm run dev               # http://localhost:3001
```

**Frontend**

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so no extra configuration is
needed for local development.

## Testing

```bash
cd server && npm test     # API integration tests on an in-memory MongoDB
```

## Project Structure

```
code-editor/
├── client/   # React + Vite — components, pages, stores, hooks, services, utils
└── server/   # Express + Mongoose — routes, controllers, services, models, middleware, compilers
```

## License

ISC — built as a portfolio project.
