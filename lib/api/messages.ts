import { apiRequest } from "@/lib/api/client";
import { mapMessage, mapMessagePage } from "@/lib/api/mappers";
import type { Message, MessagePage } from "@/types/api";

export async function listMessages(
  token: string,
  conversationId: string,
  opts: { limit?: number; before?: string } = {},
): Promise<MessagePage> {
  const raw = await apiRequest<unknown>(`/conversations/${conversationId}/messages`, {
    token,
    query: { limit: opts.limit ?? 40, before: opts.before },
  });
  return mapMessagePage(raw, conversationId);
}

export async function sendMessage(
  token: string,
  conversationId: string,
  text: string,
): Promise<Message> {
  const raw = await apiRequest<unknown>("/messages", {
    method: "POST",
    token,
    body: { conversationId, text },
  });
  const message = mapMessage(raw, conversationId);
  if (!message) throw new Error("Message sent but response was unexpected.");
  return message;
}
