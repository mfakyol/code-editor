# Project-Specific — Code Editor (CodePen clone)

Notes unique to **this** repo. General standards live in the sibling docs
(`nodejs-backend-security.md`, `backend-file-structure.md`, `frontend-structure.md`).

## Topology
- Two independent apps, deployed separately:
  - `client/` — React + Vite SPA, dev on `:5173`.
  - `server/` — Express API, dev on `:3001`. Serves **only** `/api/*` and `/health`
    — it does **not** serve the app HTML.
- **Implication:** an app-level CSP must be set at the client host / `index.html`,
  **not** in the server's `helmet` (which only affects JSON responses). Helmet's CSP
  is intentionally disabled server-side.
- Vite dev server proxies `/api` → `:3001`.
- Live: https://codeeditor.fatihakyol.com/

## Preview architecture (the core of the app)
- `client/src/utils/buildSrcDoc.ts` assembles a full HTML document that is rendered
  in a **sandboxed iframe** (`allow-scripts`, no `allow-same-origin`) — user code
  runs in an isolated opaque origin and can't touch the app's cookies/DOM.
- The injected bootstrap script forwards `console.*` output and runtime errors to the
  parent via `postMessage(..., '*')` (targets `window.parent`, i.e. the app page).
- Console **REPL**: the parent posts `{ type: 'preview-eval', code }`; the iframe runs
  it via `eval`. The iframe guards this with `event.source === window.parent`, and the
  parent (`Preview.tsx`) guards inbound messages with `event.source === iframe.contentWindow`.
- Shared by editor `Preview`, `PenView`, `Embed`, and the `PenCard` thumbnail — so
  changes to `buildSrcDoc` affect all of them.
- `Embed` (`/embed/:id`) is a **read-only** preview (iframe only), not the full editor.

## Preprocessor compile flow
- Client calls `POST /api/compile` **only** when a preprocessor is selected; otherwise
  it assembles the doc client-side (identity compile).
- Server compilers (`server/src/compilers/`):
  - HTML: Pug & Haml run in `node:vm` with a hard timeout; Markdown via `marked`.
  - CSS: Sass/SCSS via dart-sass `compileString` (filesystem-sandboxed by default);
    Less/Stylus reject `@import`/`@require`.
  - JS: TypeScript, CoffeeScript, Babel (JSX).
- **Known gap:** compile is synchronous and can block the event loop; a real
  wall-clock timeout needs `worker_threads` (not yet done).

## Data / env
- MongoDB. Dev DB name comes from `.env.example` (`codepen-clone`); the env fallback
  in `config/env` differs (`code-editor`) — set `MONGODB_URI` explicitly.
- Models: `User`, `Pen`, `Like`, `Comment`. `Pen` cascades deletes to its `Like`/`Comment`.

## Testing
- Backend: Vitest + `supertest` + `mongodb-memory-server` (in `server/test/`).
- Client: **no test suite** currently (no `test` script / Vitest in `client`). Don't
  claim frontend tests in docs/README.

## Conventions for this repo/owner
- **Do not add a `Co-Authored-By` trailer** to commits (owner preference).
- Prefer small, single-concern commits; split shared test files by concern when needed.

## Open follow-ups (not yet done)
- Move preprocessor compilation to `worker_threads` with a wall-clock timeout (DoS hardening).
- App-level CSP via a separate preview origin (see `frontend-structure.md`).
- Structured logging (pino) instead of `console.*` on the server.
