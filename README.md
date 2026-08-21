# Switchboard

Take-home chat app: document the mock API, then ship a 1-to-1 + group messenger and a landing page as **one Next.js app**.

| Part | What | URL |
| --- | --- | --- |
| 2 | Landing | `/` |
| 1 | Login | `/login` |
| 1 | Chat list | `/chat` (redirects to `/login` if unsigned) |
| 1 | Thread | `/chat/[conversationId]` |
| 1 | API docs | [docs/API.md](docs/API.md) |

Demo locally: [http://localhost:3000](http://localhost:3000). After Vercel: landing `https://<app>.vercel.app/`, chat `https://<app>.vercel.app/chat`.

---

## What is implemented

- Login with phone + name (API auto-registers new numbers; no signup screen)
- JWT in `localStorage` via Zustand persist; restore with `GET /auth/me`
- Search users by name or phone; start or open a 1-to-1
- Create a named group (at least two other people)
- Message history, own vs other bubbles, timestamps, sender names (direct chats use API `participant`)
- Send via `POST /messages`; empty / whitespace blocked in the composer
- Optimistic send, failed bubble + Retry
- Socket.io `message:new` / `conversation:updated`; upsert by message id
- Reconnect banner + refetch catch-up (Render sleep)
- Stick-to-bottom scroll; no force-scroll while reading older messages; “New messages” pill
- Load earlier via `before` cursor
- Loading / empty / error on login, search, lists, send
- Mobile: list at `/chat`, thread + Back at `/chat/[id]`
- Landing (switchboard visual) + Framer Motion
- Playwright e2e against the live mock API

Not built (API exists, PDF does not require UI): group add/remove/promote/rename.

---

## Stack

- **Next.js 16.3.2** App Router, React 19, TypeScript
- **Tailwind CSS 3** + **Inter** (`next/font`)
- **TanStack Query** — conversations, search, messages
- **Zustand persist** — `{ token, user }` only
- **socket.io-client** — same-origin `/backend/socket.io` (rewritten to Render)
- **Zod** — login fields
- **Framer Motion** — landing, login enter, new message bubbles
- **Playwright** — `e2e/` (6 specs, Chromium)

Skipped: React Hook Form, shadcn, Redux, next-auth.

---

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

```

REST and Socket.io both go through `/backend` on this app (rewritten to Render) so Vercel is not blocked by CORS. If the socket is down, the chat refetches every 4s. The first request after a Render sleep can take tens of seconds.

### Scripts

| Command | |
| --- | --- |
| `npm run dev` | Turbopack dev server |
| `npm run build` / `npm start` | production |
| `npx playwright install chromium` | browsers (once) |
| `npm test` | Playwright (reuses `localhost:3000` if already running) |
| `npm run test:ui` / `npm run test:headed` | Playwright UI / headed |

### Playwright coverage

- Landing CTA → `/login`
- Empty login blocked
- `/chat` without session → `/login`
- New phone registers → chat sidebar
- Search `Ada` in New chat
- Whitespace composer leaves Send disabled

---

## Architecture

```
app/                 routes: /, /login, /chat, /chat/[id]
components/landing   landing + motion
components/chat      shell, sidebar, message pane, dialogs, login form
components/ui        Button, Input, Avatar, states
lib/api              fetch client, feature calls, mappers
lib/realtime         socket singleton
hooks                session restore, socket, stick-to-bottom
stores               Zustand session
e2e                  Playwright
docs/API.md          Part 1 API documentation
```

Chat is a client tree (JWT, socket, scroll). Landing is a client page because of Motion. API JSON is mapped in `lib/api/mappers.ts` (`_id` → `id`, `type: "direct"` + `participant` → conversation title/name lookup, `{ messages, hasMore }` → chronological list).

---

## Deploy

Import the GitHub repo into Vercel. Env defaults match `.env.example`. Submissions need a public (or shared) repo **and** two working demo URLs.

---

## Part 3 — Thought process

One App Router project so Parts 1 and 2 share a deploy. Chat cannot be RSC: session, Socket.io, and stick-to-bottom are client state. TanStack Query owns server cache; Zustand only holds the JWT. Direct REST to Render (no BFF) unless CORS appears. Madagascar.

**Landing:** switchboard palette (ink / brass / signal), product preview of the chat chrome, Inter for UI. Motion is for the landing story and new bubbles, not for replaying history on every load.

**Trade-offs:** no group-admin screens; “Load earlier” instead of infinite scroll; localStorage JWT (the mock API cannot set httpOnly cookies on our domain).

### AI usage

Cursor was used for OpenAPI extraction, scaffolding, Motion, Playwright, and drafts of this README. Mapper rules, scroll behavior, and the switchboard look were kept as product decisions. Template SaaS landing and treating polling as “realtime” were rejected.

### API issues and workarounds

See [docs/API.md](docs/API.md). Short version:

- Swagger is request-only; we documented live responses ourselves
- Missing token → **400** `NO_TOKEN` (treat 400/401 as logged out on `/auth/me`)
- Conversations `{ data }`; search a bare array; messages `{ messages, hasMore }`
- Direct chat: singular `participant`, not `participants`
- `lastMessage` has no `_id`; `sender` is a user id string
- Message field is `conversation`, not `conversationId`
- `GET /api/health` is 404; health is `/health` on the origin
- Search `q` is required → debounce, min 2 characters
- Socket reconnect refetch is catch-up, not polling-as-websocket

### If there were more time

Group admin UI, two-browser Playwright for `message:new`, and a Vercel deploy in this repo’s CI.
