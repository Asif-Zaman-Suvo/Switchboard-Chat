"use client";

import type { User } from "@/types/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setSession: (token: string, user: User) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setSession: (token, user) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: "switchboard-session",
      skipHydration: true,
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
