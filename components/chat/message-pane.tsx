"use client";

import { Banner, EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useStickToBottom } from "@/hooks/use-stick-to-bottom";
import { upsertMessage } from "@/hooks/use-chat-socket";
import { ApiError } from "@/lib/api/client";
import { listConversations } from "@/lib/api/conversations";
import { listMessages, sendMessage } from "@/lib/api/messages";
import { cn, conversationTitle, formatClock } from "@/lib/utils";
import { useSessionStore } from "@/stores/session-store";
import type { Message } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

export function MessagePane({ conversationId }: { conversationId: string }) {
  const token = useSessionStore((s) => s.token)!;
  const me = useSessionStore((s) => s.user);
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [olderError, setOlderError] = useState<string | null>(null);

  const conversations = useQuery({
    queryKey: ["conversations"],
    queryFn: () => listConversations(token),
  });
  const conversation = conversations.data?.find((c) => c.id === conversationId);

  const messagesQuery = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const page = await listMessages(token, conversationId, { limit: 40 });
      return page.messages;
    },
  });

  const messages = messagesQuery.data ?? [];
  const { scrollerRef, stuck, unseen, onScroll, scrollToBottom } = useStickToBottom(messages.length);

  const send = useMutation({
    mutationFn: (value: string) => sendMessage(token, conversationId, value),
    onMutate: async (value) => {
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });
      const prev = queryClient.getQueryData<Message[]>(["messages", conversationId]);
      const optimistic: Message = {
        id: `temp-${crypto.randomUUID()}`,
        conversationId,
        senderId: me?.id ?? "me",
        senderName: me?.name ?? null,
        text: value,
        createdAt: new Date().toISOString(),
        status: "sending",
      };
      queryClient.setQueryData<Message[]>(["messages", conversationId], (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      setText("");
      return { prev, optimisticId: optimistic.id };
    },
    onError: (_err, _value, ctx) => {
      queryClient.setQueryData<Message[]>(["messages", conversationId], (old) =>
        (old ?? []).map((m) => (m.id === ctx?.optimisticId ? { ...m, status: "failed" } : m)),
      );
    },
    onSuccess: (message, _value, ctx) => {
      queryClient.setQueryData<Message[]>(["messages", conversationId], (old) => {
        const withoutTemp = (old ?? []).filter((m) => m.id !== ctx?.optimisticId);
        return upsertMessage(withoutTemp, message);
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const retry = (failed: Message) => {
    queryClient.setQueryData<Message[]>(["messages", conversationId], (old) =>
      (old ?? []).filter((m) => m.id !== failed.id),
    );
    send.mutate(failed.text);
  };

  const loadOlder = async () => {
    const oldest = messages[0];
    if (!oldest) return;
    const el = scrollerRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      setOlderError(null);
      const page = await listMessages(token, conversationId, { limit: 40, before: oldest.id });
      queryClient.setQueryData<Message[]>(["messages", conversationId], (old) => {
        const seen = new Set((old ?? []).map((m) => m.id));
        const incoming = page.messages.filter((m) => !seen.has(m.id));
        return [...incoming, ...(old ?? [])];
      });
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - prevHeight;
      });
    } catch (err) {
      setOlderError(err instanceof ApiError ? err.message : "Could not load earlier messages");
    }
  };

  const title = conversation ? conversationTitle(conversation, me?.id ?? "") : "Line";
  const participants = useMemo(() => {
    if (!conversation) return "";
    return conversation.participants
      .filter((p) => p.id !== me?.id)
      .map((p) => p.name)
      .join(", ");
  }, [conversation, me?.id]);

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    send.mutate(value);
  };

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-ink">
      <header className="flex items-center gap-3 border-b border-line px-3 py-3 md:px-5">
        <Link href="/chat" className="font-mono text-xs text-brass md:hidden">
          Back
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-xl text-paper">{title}</h1>
          {participants ? (
            <p className="truncate font-mono text-[11px] text-mute">{participants}</p>
          ) : null}
        </div>
      </header>

      {messagesQuery.isPending ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="ml-auto h-12 w-1/2" />
          <Skeleton className="h-12 w-1/2" />
        </div>
      ) : messagesQuery.isError ? (
        <ErrorState
          message={
            messagesQuery.error instanceof ApiError
              ? messagesQuery.error.message
              : "Could not load messages"
          }
          onRetry={() => messagesQuery.refetch()}
        />
      ) : (
        <div className="relative min-h-0 flex-1">
          <div ref={scrollerRef} onScroll={onScroll} className="h-full overflow-y-auto px-3 py-4 md:px-6">
            {messages.length >= 40 ? (
              <div className="mb-4 text-center">
                <button
                  type="button"
                  onClick={loadOlder}
                  className="font-mono text-[11px] uppercase tracking-wider text-brass"
                >
                  Load earlier
                </button>
                {olderError ? <p className="mt-1 text-xs text-signal">{olderError}</p> : null}
              </div>
            ) : null}
            {messages.length === 0 ? (
              <EmptyState title="Quiet line" body="Send the first message." />
            ) : (
              <ol className="space-y-3">
                <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const mine = message.senderId === me?.id;
                  const senderLabel =
                    mine ? "You" : message.senderName ?? conversation?.participants.find((p) => p.id === message.senderId)?.name ?? "Unknown";
                  return (
                    <motion.li
                      key={message.id}
                      className={cn("flex flex-col", mine ? "items-end" : "items-start")}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <span className="mb-1 font-mono text-[10px] uppercase tracking-wider text-mute">
                        {conversation?.isGroup || !mine ? senderLabel : "You"} · {formatClock(message.createdAt)}
                      </span>
                      <div
                        className={cn(
                          "max-w-[min(78%,36rem)] whitespace-pre-wrap break-words rounded-sm px-3 py-2 text-sm",
                          mine ? "bg-brass text-ink" : "border border-line bg-[#161410] text-paper",
                          message.status === "sending" && "opacity-60",
                          message.status === "failed" && "border border-signal bg-transparent text-paper",
                        )}
                      >
                        {message.text}
                      </div>
                      {message.status === "failed" ? (
                        <button
                          type="button"
                          onClick={() => retry(message)}
                          className="mt-1 font-mono text-[10px] uppercase text-signal"
                        >
                          Retry
                        </button>
                      ) : null}
                    </motion.li>
                  );
                })}
                </AnimatePresence>
              </ol>
            )}
          </div>
          {!stuck && unseen > 0 ? (
            <motion.button
              type="button"
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 border border-brass bg-ink px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-brass"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              New messages ({unseen})
            </motion.button>
          ) : null}
        </div>
      )}

      <form
        className="flex gap-2 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Transmit…"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-sm border border-line bg-[#100f0c] px-3 py-2.5 text-sm text-paper outline-none placeholder:text-mute focus:border-brass"
        />
        <Button type="submit" disabled={!text.trim() || send.isPending} variant="signal">
          {send.isPending ? <Spinner /> : "Send"}
        </Button>
      </form>
      {send.isError && !(send.variables && text) ? (
        <Banner>
          {send.error instanceof ApiError ? send.error.message : "Send failed"} — retry from the failed bubble
        </Banner>
      ) : null}
    </section>
  );
}
