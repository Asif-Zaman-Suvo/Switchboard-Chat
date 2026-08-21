"use client";

import { CreateGroupDialog, NewChatDialog } from "@/components/chat/dialogs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { listConversations } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/client";
import { conversationTitle, formatWhen } from "@/lib/utils";
import { useSessionStore } from "@/stores/session-store";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export function ConversationSidebar({ activeId }: { activeId?: string }) {
  const token = useSessionStore((s) => s.token)!;
  const user = useSessionStore((s) => s.user);
  const clear = useSessionStore((s) => s.clear);
  const [newOpen, setNewOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);

  const list = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(token),
  });

  const conversations = [...(list.data ?? [])].sort((a, b) => {
    const at = a.lastMessage?.createdAt ?? a.createdAt ?? "";
    const bt = b.lastMessage?.createdAt ?? b.createdAt ?? "";
    return bt.localeCompare(at);
  });

  return (
    <aside className="flex h-full w-full flex-col border-r border-line bg-[#100f0c] md:w-[320px] md:shrink-0" data-testid="chat-sidebar">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Avatar name={user?.name ?? "You"} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-paper">{user?.name}</p>
          <p className="truncate font-mono text-[11px] text-mute">{user?.phone}</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="font-mono text-[10px] uppercase tracking-wider text-mute hover:text-signal"
        >
          Sign out
        </button>
      </header>
      <div className="flex gap-2 border-b border-line p-3">
        <Button className="flex-1" onClick={() => setNewOpen(true)} data-testid="new-chat">
          New chat
        </Button>
        <Button variant="ghost" onClick={() => setGroupOpen(true)} data-testid="new-group">
          Group
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {list.isPending ? (
          <div className="space-y-2 p-3">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : list.isError ? (
          <ErrorState
            message={list.error instanceof ApiError ? list.error.message : "Could not load conversations"}
            onRetry={() => list.refetch()}
          />
        ) : conversations.length === 0 ? (
          <EmptyState title="No open lines" body="Search for someone and start a conversation." />
        ) : (
          <ul>
            {conversations.map((c) => {
              const title = conversationTitle(c, user?.id ?? "");
              const active = c.id === activeId;
              return (
                <li key={c.id}>
                  <Link
                    href={`/chat/${c.id}`}
                    className={`flex gap-3 border-b border-line/70 px-4 py-3 ${active ? "bg-line" : "hover:bg-line/50"}`}
                  >
                    <Avatar name={title} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm text-paper">{title}</span>
                        {c.lastMessage ? (
                          <span className="shrink-0 font-mono text-[10px] text-mute">
                            {formatWhen(c.lastMessage.createdAt)}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-mute">
                        {c.lastMessage?.text ?? (c.isGroup ? "Group line" : "No messages yet")}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <NewChatDialog open={newOpen} onClose={() => setNewOpen(false)} />
      <CreateGroupDialog open={groupOpen} onClose={() => setGroupOpen(false)} />
    </aside>
  );
}
