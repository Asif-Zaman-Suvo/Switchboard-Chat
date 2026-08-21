"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { create } from "zustand";
import { mapConversation, mapMessage } from "@/lib/api/mappers";
import { disconnectSocket, getSocket } from "@/lib/realtime/socket";
import { useSessionStore } from "@/stores/session-store";
import type { Message } from "@/types/api";

export type SocketStatus = "idle" | "connecting" | "connected" | "disconnected";

export const useSocketStatus = create<{
  status: SocketStatus;
  setStatus: (status: SocketStatus) => void;
}>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
}));

export function upsertMessage(list: Message[] | undefined, incoming: Message): Message[] {
  const current = list ?? [];
  const idx = current.findIndex((m) => m.id === incoming.id);
  if (idx >= 0) {
    const next = [...current];
    next[idx] = { ...current[idx], ...incoming, status: "sent" };
    return next;
  }
  const optimistic = current.findIndex(
    (m) =>
      m.status === "sending" &&
      m.senderId === incoming.senderId &&
      m.text === incoming.text,
  );
  if (optimistic >= 0) {
    const next = [...current];
    next[optimistic] = incoming;
    return next;
  }
  return [...current, incoming];
}

export function useChatSocket() {
  const token = useSessionStore((s) => s.token);
  const queryClient = useQueryClient();
  const setStatus = useSocketStatus((s) => s.setStatus);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setStatus("idle");
      return;
    }

    setStatus("connecting");
    const socket = getSocket(token);

    const onConnect = () => {
      setStatus("connected");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    };
    const onDisconnect = () => setStatus("disconnected");
    const onMessage = (payload: unknown) => {
      const message = mapMessage(payload);
      if (!message) return;
      queryClient.setQueryData<Message[]>(["messages", message.conversationId], (old) =>
        upsertMessage(old, message),
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    const onConversation = (payload: unknown) => {
      const conversation = mapConversation(payload);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (conversation) {
        queryClient.invalidateQueries({ queryKey: ["messages", conversation.id] });
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message:new", onMessage);
    socket.on("conversation:updated", onConversation);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message:new", onMessage);
      socket.off("conversation:updated", onConversation);
      disconnectSocket();
      setStatus("idle");
    };
  }, [token, queryClient, setStatus]);
}
