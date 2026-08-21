"use client";

import { ConversationSidebar } from "@/components/chat/conversation-sidebar";
import { Banner } from "@/components/ui/states";
import { useSocketStatus } from "@/hooks/use-chat-socket";
import type { ReactNode } from "react";

export function ChatShell({
  activeId,
  children,
  showList,
  showThread,
}: {
  activeId?: string;
  children: ReactNode;
  showList: boolean;
  showThread: boolean;
}) {
  const status = useSocketStatus((s) => s.status);

  return (
    <div className="flex h-dvh flex-col bg-ink text-paper">
      {status === "connecting" || status === "disconnected" ? (
        <Banner>
          {status === "connecting"
            ? "Catching up — reconnecting to the live line"
            : "Live line dropped. Reconnecting… messages will catch up when it returns."}
        </Banner>
      ) : null}
      <div className="flex min-h-0 flex-1">
        <div className={showList ? "flex h-full w-full md:w-auto" : "hidden md:flex"}>
          <ConversationSidebar activeId={activeId} />
        </div>
        <div className={showThread ? "flex min-w-0 flex-1" : "hidden min-w-0 flex-1 md:flex"}>
          {children}
        </div>
      </div>
    </div>
  );
}
