import { apiRequest } from "@/lib/api/client";
import { mapSession, mapUser } from "@/lib/api/mappers";
import type { LoginRequest, User } from "@/types/api";

export async function login(body: LoginRequest) {
  const raw = await apiRequest<unknown>("/auth/login", { method: "POST", body });
  const session = mapSession(raw);
  if (!session) throw new Error("Login succeeded but the response shape was unexpected.");
  return session;
}

export async function getMe(token: string): Promise<User> {
  const raw = await apiRequest<unknown>("/auth/me", { token });
  const user = mapUser(raw);
  if (!user) throw new Error("Could not read the current user.");
  return user;
}
