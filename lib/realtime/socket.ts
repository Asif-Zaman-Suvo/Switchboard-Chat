import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Same-origin Engine.IO path; Next rewrites `/backend/*` to Render. */
export const SOCKET_PATH = "/backend/socket.io";

export function getSocket(token: string): Socket {
  const existingToken = (socket?.auth as { token?: string } | undefined)?.token;
  if (socket && existingToken === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }
  if (socket) disconnectSocket();
  socket = io({
    auth: { token },
    path: SOCKET_PATH,
    transports: ["polling", "websocket"],
    upgrade: true,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}
