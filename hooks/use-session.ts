"use client";

import { getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useSessionStore } from "@/stores/session-store";
import { useEffect, useState } from "react";

export function useSession() {
  const { token, user, hydrated, setSession, clear } = useSessionStore();
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    void useSessionStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setRestoring(false);
      return;
    }
    let cancelled = false;
    setRestoring(true);
    getMe(token)
      .then((me) => {
        if (!cancelled) setSession(token, me);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
          clear();
        }
      })
      .finally(() => {
        if (!cancelled) setRestoring(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, token, setSession, clear]);

  return { token, user, hydrated, restoring, ready: hydrated && !restoring };
}
