import { apiRequest } from "@/lib/api/client";
import { mapConversation, unwrapList } from "@/lib/api/mappers";
import type { Conversation, CreateGroupRequest } from "@/types/api";

export async function listConversations(token: string): Promise<Conversation[]> {
  const raw = await apiRequest<unknown>("/conversations", { token });
  return unwrapList(raw)
    .map(mapConversation)
    .filter((c): c is Conversation => Boolean(c));
}

export async function startDirect(token: string, userId: string): Promise<Conversation> {
  const raw = await apiRequest<unknown>("/conversations", {
    method: "POST",
    token,
    body: { userId },
  });
  const conversation = mapConversation(raw);
  if (!conversation) throw new Error("Conversation created but response was unexpected.");
  return conversation;
}

export async function createGroup(token: string, body: CreateGroupRequest): Promise<Conversation> {
  const raw = await apiRequest<unknown>("/conversations/group", {
    method: "POST",
    token,
    body,
  });
  const conversation = mapConversation(raw);
  if (!conversation) throw new Error("Group created but response was unexpected.");
  return conversation;
}
