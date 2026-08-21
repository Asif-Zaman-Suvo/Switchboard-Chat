import type {
  ApiErrorBody,
  Conversation,
  Message,
  MessagePage,
  User,
} from "@/types/api";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function idOf(value: unknown): string | null {
  if (typeof value === "string") return value;
  const rec = asRecord(value);
  if (!rec) return null;
  return asString(rec.id) ?? asString(rec._id);
}

export function unwrapList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  if (Array.isArray(rec.data)) return rec.data;
  if (Array.isArray(rec.users)) return rec.users;
  if (Array.isArray(rec.messages)) return rec.messages;
  if (Array.isArray(rec.conversations)) return rec.conversations;
  if (Array.isArray(rec.items)) return rec.items;
  return [];
}

export function mapError(value: unknown, fallback: string): ApiErrorBody {
  const rec = asRecord(value);
  const err = asRecord(rec?.error) ?? rec;
  if (!err) return { message: fallback, code: null, details: [] };
  const detailsRaw = err.details;
  const details = Array.isArray(detailsRaw)
    ? detailsRaw.flatMap((item) => {
        const d = asRecord(item);
        if (!d) return [];
        return [
          {
            path: asString(d.path) ?? "",
            message: asString(d.message) ?? "Invalid",
          },
        ];
      })
    : [];
  return {
    message: asString(err.message) ?? fallback,
    code: asString(err.code),
    details,
  };
}

export function mapUser(value: unknown): User | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const id = idOf(rec);
  const name = asString(rec.name);
  const phone = asString(rec.phone);
  if (!id || !name || !phone) return null;
  return {
    id,
    name,
    phone,
    createdAt: asString(rec.createdAt),
  };
}

export function mapMessage(value: unknown, conversationIdFallback?: string): Message | null {
  const rec = asRecord(value) ?? asRecord(asRecord(value)?.message);
  if (!rec) return null;
  const id = idOf(rec);
  const text = asString(rec.text) ?? asString(rec.body) ?? asString(rec.content);
  const sender =
    mapUser(rec.sender) ??
    mapUser(rec.author) ??
    (typeof rec.senderId === "object" ? mapUser(rec.senderId) : null);
  const senderId = sender?.id ?? idOf(rec.senderId) ?? idOf(rec.sender) ?? idOf(rec.userId);
  const conversationId =
    idOf(rec.conversationId) ??
    idOf(rec.conversation) ??
    conversationIdFallback ??
    null;
  if (text == null || !senderId || !conversationId) return null;
  const createdAt = asString(rec.createdAt) ?? asString(rec.sentAt) ?? new Date().toISOString();
  return {
    id: id ?? `preview-${conversationId}-${senderId}-${createdAt}`,
    conversationId,
    senderId,
    senderName: sender?.name ?? asString(rec.senderName),
    text,
    createdAt,
    status: "sent",
  };
}

function mapIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(idOf).filter((id): id is string => Boolean(id));
}

export function mapConversation(value: unknown): Conversation | null {
  const rec = asRecord(value) ?? asRecord(asRecord(value)?.conversation);
  if (!rec) return null;
  const id = idOf(rec);
  if (!id) return null;
  const other = mapUser(rec.participant);
  const fromList = unwrapList(rec.participants)
    .map(mapUser)
    .filter((u): u is User => Boolean(u));
  const participants = fromList.length > 0 ? fromList : other ? [other] : [];
  const participantIds =
    mapIds(rec.participantIds).length > 0
      ? mapIds(rec.participantIds)
      : mapIds(rec.members).length > 0
        ? mapIds(rec.members)
        : participants.map((p) => p.id);
  const adminIds = mapIds(rec.admins).length > 0 ? mapIds(rec.admins) : mapIds(rec.adminIds);
  const type = asString(rec.type);
  const isGroup =
    rec.isGroup === true ||
    type === "group" ||
    (rec.isGroup !== false && type !== "direct" && type !== "dm" && participantIds.length > 2);
  return {
    id,
    name: asString(rec.name),
    isGroup,
    participantIds,
    participants,
    adminIds,
    lastMessage: mapMessage(rec.lastMessage, id),
    createdAt: asString(rec.createdAt),
  };
}

export function mapMessagePage(value: unknown, conversationId: string): MessagePage {
  const rec = asRecord(value);
  const rawList = Array.isArray(rec?.messages) ? rec.messages : unwrapList(value);
  const list = rawList.map((item) => mapMessage(item, conversationId));
  const messages = list.filter((m): m is Message => Boolean(m));
  const chronological = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const nextCursor =
    asString(rec?.nextCursor) ??
    asString(rec?.cursor) ??
    asString(asRecord(rec?.pagination)?.next) ??
    (rec?.hasMore === true && chronological[0] ? chronological[0].id : null);
  return { messages: chronological, nextCursor };
}

export function mapSession(value: unknown): { token: string; user: User } | null {
  const rec = asRecord(value);
  if (!rec) return null;
  const token = asString(rec.token) ?? asString(rec.accessToken);
  const user = mapUser(rec.user) ?? mapUser(rec);
  if (!token || !user) return null;
  return { token, user };
}
