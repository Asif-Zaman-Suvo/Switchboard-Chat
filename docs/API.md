# Chat API documentation

Part 1 deliverable: how this app uses the take-home mock API.

Swagger is **request-only**. Response bodies and status codes below were captured from live HTTP (and how `lib/api/mappers.ts` normalizes them).

- Swagger UI: [https://frontend-task-chatapp.onrender.com/docs/](https://frontend-task-chatapp.onrender.com/docs/)
- REST: `https://frontend-task-chatapp.onrender.com/api`
- Socket.io on the API: host root `/socket.io` (not `/api`)
- This app proxies REST as `/backend/api` and Socket.io as `/backend/socket.io`
- Health: `GET https://frontend-task-chatapp.onrender.com/health` → `{ "status": "ok" }`
- `GET /api/health` is **404**. Swagger lists `/health` under the `/api` server; the live server does not.

---

## Authentication

1. `POST /auth/login` with `phone` and `name`. New phone → register; existing phone → login. No signup route.
2. Protected REST: `Authorization: Bearer <jwt>`.
3. Socket (this app): `io({ auth: { token }, path: "/backend/socket.io" })` which rewrites to the API’s `/socket.io`.

No token on a protected route → **400**:

```json
{ "error": { "message": "No token provided", "code": "NO_TOKEN" } }
```

The app treats **400 and 401** on `GET /auth/me` as a logged-out session.

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

| Feature | Method | Path | Request |
| --- | --- | --- | --- |
| Login | POST | `/auth/login` | `{ phone, name }` |
| Restore session | GET | `/auth/me` | Bearer |
| Search people | GET | `/users/search?q=` | `q` required |
| List threads | GET | `/conversations` | Bearer |
| Start 1-to-1 | POST | `/conversations` | `{ userId }` |
| Create group | POST | `/conversations/group` | `{ name, participantIds }` |
| History | GET | `/conversations/{id}/messages` | `limit`, `before` |
| Send | POST | `/messages` | `{ conversationId, text }` |
| Incoming | Socket | `message:new` | see below |
| Group change | Socket | `conversation:updated` | invalidate lists |

Send is **REST only** in this app (clear errors + optimistic rows). Socket `message:send` exists on the server; we do not use it.

Group admin REST exists (`POST .../participants`, `DELETE .../participants/{userId}`, `POST .../admins`, `PATCH .../{id}`). **No UI** — not required by the assignment.

---

## REST details

Paths are relative to `/api`.

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

IDs are `_id` strings. Mapper exposes `id`.

### `GET /auth/me`

Bearer. **200:** same user object as `user` on login (no token wrapper).

### `GET /users/search?q=`

Bearer. `q` required. **200:** array of `{ "_id", "name", "phone" }` (no `createdAt`). Seed users include “Ada Lovelace”. The UI only fires search at ≥2 characters (debounce 250ms).

### `GET /conversations`

Bearer. **200:** `{ "data": [ ... ] }` — not a bare array.

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

There is **no** `participants` array. The other person is `participant`. The mapper copies that into `participants[]` so the header and bubbles can show the name (otherwise the UI showed “Direct chat” / “Unknown”).

**Group** (`type: "group"`): `name`, `participants: User[]`, `admins: string[]`, `createdBy`, plus `lastMessage`.

`lastMessage` has **no** `_id`. Mapper synthesizes a preview id so the sidebar can show the snippet.

### `POST /conversations`

Body: `{ "userId": "<other _id>" }`. Spec: start **or open**. Client navigates to the returned conversation `id` / `_id`.

### `GET /conversations/{id}/messages`

Query: `limit`, `before` (message id, older page). Not offset pagination.

**Live 200:**

```json
{
  "messages": [
    {
      "_id": "...",
      "conversation": "6a885c03e5d6aac975227020",
      "sender": "6a88554ae5d6aac975224a87",
      "text": "ki koros",
      "createdAt": "2026-08-21T14:09:27.097Z"
    }
  ],
  "hasMore": false
}
```

- Wrapper is `{ messages, hasMore }`, not `{ data }`
- Conversation field is `conversation`, not `conversationId`
- `sender` is a **user id string**, not a populated user
- Live order is newest-first; the client **sorts by `createdAt` ascending** for the thread

### `POST /messages`

Body: `{ "conversationId", "text" }`. Composer refuses empty/whitespace. Failed sends stay in the thread with Retry.

### `POST /conversations/group`

Body: `{ "name", "participantIds" }` — ids **besides you**. Spec: group = three or more members. UI requires ≥2 other people.

---

## WebSocket (Socket.io)

Not in OpenAPI. Handshake confirmed: `GET /socket.io/?EIO=4&transport=polling`.

```js
io("https://frontend-task-chatapp.onrender.com", { auth: { token } });
```

| Direction | Event | App behavior |
| --- | --- | --- |
| client → server | `message:send` `{ conversationId, text }` | unused |
| server → client | `message:new` | map as a Message (or `{ message }`); upsert by `id` |
| server → client | `conversation:updated` | invalidate conversation (and message) queries |

On `connect`, the app refetches conversations + messages (catch-up after Render sleep). That is **not** polling presented as realtime. Disconnect shows a banner.

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
  isGroup: boolean; // from type === "group"
  participantIds: string[];
  participants: User[]; // direct: [participant]
  adminIds: string[];
  lastMessage: Message | null;
  createdAt: string | null;
};
```

---

## Quirks this implementation depends on

- Request-only OpenAPI — responses documented here from live calls
- `_id` vs `id`
- Three list shapes: search array, conversations `{ data }`, messages `{ messages, hasMore }`
- Direct `participant` vs group `participants`
- Unauthenticated → **400** `NO_TOKEN`, not 401
- Health not under `/api`
- Render cold start on first REST/socket
- CORS: REST and Socket.io both go through `/backend/*` on this Next app so the Vercel origin does not call Render from the browser. If the socket cannot connect, the UI refetches lists every 4s.
