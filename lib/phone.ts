const BD_COUNTRY = "880";

export function canonicalizePhone(raw: string): string {
  let s = raw.trim().replace(/[\s\-().]/g, "");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;

  if (s.startsWith("+")) {
    return `+${s.slice(1).replace(/\D/g, "")}`;
  }

  const digits = s.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith(BD_COUNTRY)) return `+${digits}`;
  if (digits.startsWith("0")) return `+${BD_COUNTRY}${digits.slice(1)}`;

  return `+${digits}`;
}

export function phonesEqual(a: string, b: string): boolean {
  const left = canonicalizePhone(a);
  const right = canonicalizePhone(b);
  return left.length > 0 && left === right;
}

export function looksLikePhone(q: string): boolean {
  return q.replace(/\D/g, "").length >= 8;
}

export function localBdVariant(canonical: string): string | null {
  if (!canonical.startsWith(`+${BD_COUNTRY}`)) return null;
  const rest = canonical.slice(1 + BD_COUNTRY.length);
  if (!rest) return null;
  return `0${rest}`;
}

function preferUser(a: UserLike, b: UserLike): UserLike {
  const aPlus = a.phone.trim().startsWith("+") ? 1 : 0;
  const bPlus = b.phone.trim().startsWith("+") ? 1 : 0;
  if (aPlus !== bPlus) return aPlus > bPlus ? a : b;
  if (a.phone.length !== b.phone.length) return a.phone.length > b.phone.length ? a : b;
  return a;
}

type UserLike = { id: string; phone: string };

export function uniqueByPhone<T extends UserLike>(users: T[]): T[] {
  const map = new Map<string, T>();
  for (const user of users) {
    const key = canonicalizePhone(user.phone) || user.id;
    const existing = map.get(key);
    map.set(key, existing ? (preferUser(user, existing) as T) : user);
  }
  return [...map.values()];
}
