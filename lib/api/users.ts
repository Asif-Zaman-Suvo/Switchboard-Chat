import { apiRequest } from "@/lib/api/client";
import { mapUser, unwrapList } from "@/lib/api/mappers";
import { canonicalizePhone, localBdVariant, looksLikePhone, uniqueByPhone } from "@/lib/phone";
import type { User } from "@/types/api";

async function searchOnce(token: string, q: string): Promise<User[]> {
  const raw = await apiRequest<unknown>("/users/search", { token, query: { q } });
  return unwrapList(raw)
    .map(mapUser)
    .filter((u): u is User => Boolean(u));
}

export async function searchUsers(token: string, q: string): Promise<User[]> {
  const queries = new Set<string>([q]);
  if (looksLikePhone(q)) {
    const canonical = canonicalizePhone(q);
    if (canonical) queries.add(canonical);
    const local = canonical ? localBdVariant(canonical) : null;
    if (local) queries.add(local);
  }

  const lists = await Promise.all([...queries].map((query) => searchOnce(token, query)));
  return uniqueByPhone(lists.flat());
}
