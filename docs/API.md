# Chat API documentation

Part 1 deliverable: how this app uses the take-home mock API.

Swagger is **request-only**. Response bodies and status codes were captured from live HTTP and normalized in `lib/api/mappers.ts`.

- Swagger UI: [https://frontend-task-chatapp.onrender.com/docs/](https://frontend-task-chatapp.onrender.com/docs/)
- Upstream REST: `https://frontend-task-chatapp.onrender.com/api`
- Upstream Socket.io: `https://frontend-task-chatapp.onrender.com/socket.io` (host root, **not** `/api`)
- **This app (browser):** REST ` /backend/api`, Socket.io `/backend/socket.io` (Next/`vercel.json` rewrites to upstream)
- Health: `GET https://frontend-task-chatapp.onrender.com/health` → `{ "status": "ok" }`
- `GET /api/health` is **404** (Swagger lists `/health` under the `/api` server; live does not)

---

## Authentication

1. `POST /auth/login` with `phone` and `name`. New phone → register; existing **exact string** → login. No signup route.
2. This app **canonicalizes** `phone` before login (`lib/phone.ts`): `01521331328` → `+8801521331328`. Numbers that already have `+` (e.g. `+1555…`) are left as `+` + digits. The API still keys uniqueness on the raw string; canonicalization is how we avoid a second account for BD local vs `+880`.
3. Protected REST: `Authorization: Bearer <jwt>`.
4. Socket: `io({ auth: { token }, path: "/backend/socket.io", addTrailingSlash: false, transports: ["polling"], upgrade: false })`.

No token on a protected route → **400**:

```json
{ "error": { "message": "No token provided", "code": "NO_TOKEN" } }
```

The app treats **400 and 401** on `GET /auth/me` as logged out.

Validation → **400**:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "phone", "message": "Required" }]
  }
}
```

---

## What the UI calls

Browser paths are `/backend` + upstream path. Upstream paths below are relative to `/api` except Socket.io.

| Feature | Method | Upstream | Request |
| --- | --- | --- | --- |
| Login | POST | `/auth/login` | `{ phone, name }` (phone already canonical) |
| Restore session | GET | `/auth/me` | Bearer |
| Search people | GET | `/users/search?q=` | `q` required; UI may issue extra queries for local/`+880` forms then `uniqueByPhone` |
| List threads | GET | `/conversations` | Bearer |
| Start 1-to-1 | POST | `/conversations` | `{ userId }` |
| Create group | POST | `/conversations/group` | `{ name, participantIds }` |
| History | GET | `/conversations/{id}/messages` | `limit`, `before` |
| Send | POST | `/messages` | `{ conversationId, text }` |
| Incoming | Engine.IO | `/socket.io` | event `message:new` |
| Group change | Engine.IO | `/socket.io` | event `conversation:updated` |

Send is **REST only** (errors + optimistic rows). Server also has `message:send`; unused.

Group admin REST exists. **No UI.**

---

## REST details

### `POST /auth/login`

Unauthenticated. **200:**

```json
{
  "token": "<jwt>",
  "user": {
    "_id": "6a8855a3e5d6aac975224b78",
    "name": "PlanProbe User",
    "phone": "+15557319713",
    "createdAt": "2026-08-21T13:41:55.051Z"
  }
}
```

IDs are `_id`. Mapper exposes `id`.

**Duplicate phones:** `01521331328` and `+8801521331328` are two API users. We cannot merge/delete them. Search shows one row (`uniqueByPhone`, prefers `+`). Login always sends the canonical `+880…` form for `0…` numbers.

### `GET /auth/me`

Bearer. **200:** user object (no token wrapper).

### `GET /users/search?q=`

Bearer. `q` required. **200:** `[{ "_id", "name", "phone" }]`. Seed users include “Ada Lovelace”. UI: debounce 250ms, min 2 chars. If `q` looks like a phone, also search canonical `+880…` and `0…` variants, then dedupe.

### `GET /conversations`

Bearer. **200:** `{ "data": [ ... ] }`.

**Direct** (`type: "direct"`):

```json
{
  "_id": "...",
  "type": "direct",
  "participant": { "_id": "...", "name": "Asif", "phone": "01672589499" },
  "lastMessage": { "text": "ki koros", "sender": "<userId>", "createdAt": "..." },
  "updatedAt": "..."
}
```

No `participants` array. Mapper copies `participant` into `participants[]` (otherwise header/bubbles were “Direct chat” / “Unknown”).

**Group** (`type: "group"`): `name`, `participants: User[]`, `admins`, `createdBy`, `lastMessage`.

`lastMessage` has **no** `_id`. Mapper synthesizes a preview id.

### `POST /conversations`

`{ "userId" }`. Start or open. Client navigates to returned id.

### `GET /conversations/{id}/messages`

`limit`, `before` (message id). Not offset.

**Live 200:** `{ "messages": [ { "_id", "conversation", "sender", "text", "createdAt" } ], "hasMore": false }`

- `conversation` not `conversationId`
- `sender` is a user id string
- API order is newest-first; client sorts `createdAt` ascending

### `POST /messages`

`{ "conversationId", "text" }`. UI blocks empty/whitespace. Failed sends stay in-thread with Retry.

### `POST /conversations/group`

`{ "name", "participantIds" }` besides you. UI requires ≥2 others. Picker also dedupes by canonical phone.

---

## Socket.io (this app)

Not in OpenAPI. Upstream handshake: `GET /socket.io/?EIO=4&transport=polling`.

**Do not** point the browser at Render. On Vercel that 308/404’d (`/backend/socket.io` without a dedicated rewrite; trailing slash). Client:

```js
io({
  auth: { token },
  path: "/backend/socket.io",
  addTrailingSlash: false,
  transports: ["polling"],
  upgrade: false,
});
```

| Direction | Event | App |
| --- | --- | --- |
| client → server | `message:send` | unused |
| server → client | `message:new` | map Message; upsert by id; if unparseable, invalidate queries |
| server → client | `conversation:updated` | invalidate lists |

On `connect`, refetch conversations + messages. If status is not `connected`, refetch every **4s** (catch-up). Banner: “Live line dropped…”. That interval is not claimed to be WebSocket.

`skipTrailingSlashRedirect: true` in `next.config.ts`. Explicit rewrites for `/backend/socket.io` and `/backend/socket.io/:path*` in `next.config.ts` and `vercel.json`.

---

## Client types (after mapping)

```ts
type User = { id: string; name: string; phone: string; createdAt: string | null };

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  text: string;
  createdAt: string;
  status: "sent" | "sending" | "failed"; // client-only
};

type Conversation = {
  id: string;
  name: string | null;
  isGroup: boolean;
  participantIds: string[];
  participants: User[]; // direct: [participant]
  adminIds: string[];
  lastMessage: Message | null;
  createdAt: string | null;
};
```

---

## Quirks

- Request-only OpenAPI
- `_id` vs `id`
- Search = array; conversations = `{ data }`; messages = `{ messages, hasMore }`
- Direct `participant` vs group `participants`
- Unauthenticated → **400** `NO_TOKEN`, not 401
- Health not under `/api`
- Render cold start; REST client retries 3 times
- CORS: never call Render from the Vercel origin
- Phone uniqueness is string-exact on the API; we canonicalize + dedupe in the client only
