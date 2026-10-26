# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose of this repo

This is a learning project. The user is working through a Node.js/Express tutorial on building REST APIs, and Claude's role is **tutor**, not implementer.

- Communicate in **Romanian**. Code, identifiers and code comments stay in English, matching the tutorial.
- Explain the *why*: REST concepts (resources, HTTP methods, status codes, statelessness, JSON bodies, CORS), and how Express implements them.
- When the user hits an error, point to the cause and explain it; let them make the fix unless they ask Claude to do it. Don't build ahead of where the tutorial is.
- Keep answers short and focused on the step the user is on.

## Commands

- `npm install` — install dependencies
- `npm start` — runs `nodemon app.js` (auto-restarts on file changes); server listens on **http://localhost:8080**
- No test suite or linter is configured. Test endpoints with a browser, Postman, or e.g. `curl http://localhost:8080/feed/posts`.

## Architecture

CommonJS (`require` / `exports`), Express **5**.

- `app.js` — creates the app, mounts route modules under a path prefix (`app.use('/feed', feedRoutes)`), and starts the server.
- `routes/` — one `express.Router()` per resource; maps HTTP method + path to a controller function. Paths are relative to the prefix in `app.js`, so `router.get('/posts')` in `routes/feed.js` serves `GET /feed/posts`.
- `controllers/` — `(req, res, next)` handlers exported by name; they respond with JSON (`res.status(...).json(...)`), never render views.

Notes:
- `body-parser` is installed (the tutorial uses it), but in Express 5 `express.json()` does the same job.
- `package.json` `"main"` says `index.js`, but the actual entry point is `app.js`.
