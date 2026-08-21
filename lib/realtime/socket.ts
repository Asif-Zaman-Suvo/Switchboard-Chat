import { io, type Socket } from "socket.io-client";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "https://frontend-task-chatapp.onrender.com";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  const existingToken = (socket?.auth as { token?: string } | undefined)?.token;
  if (socket && existingToken === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }
  if (socket) disconnectSocket();
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}
