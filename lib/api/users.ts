import { apiRequest } from "@/lib/api/client";
import { mapUser, unwrapList } from "@/lib/api/mappers";
import type { User } from "@/types/api";

export async function searchUsers(token: string, q: string): Promise<User[]> {
  const raw = await apiRequest<unknown>("/users/search", { token, query: { q } });
  return unwrapList(raw)
    .map(mapUser)
    .filter((u): u is User => Boolean(u));
}
