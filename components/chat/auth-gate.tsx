"use client";

import { useChatSocket } from "@/hooks/use-chat-socket";
import { useSession } from "@/hooks/use-session";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, ready } = useSession();
  const router = useRouter();
  useChatSocket();

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-ink text-brass">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!token) return null;
  return <>{children}</>;
}
