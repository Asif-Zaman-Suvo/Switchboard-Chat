import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function formatClock(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return formatClock(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function conversationTitle(c: ConversationLike, meId: string) {
  if (c.isGroup) return c.name?.trim() || "Group";
  const other =
    c.participants.find((p) => p.id !== meId) ??
    c.participants.find((p) => p.id === c.participantIds.find((id) => id !== meId));
  return other?.name ?? "Direct chat";
}

type ConversationLike = {
  isGroup: boolean;
  name: string | null;
  participants: { id: string; name: string }[];
  participantIds: string[];
};
