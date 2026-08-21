"use client";

import { ChatShell } from "@/components/chat/chat-shell";
import { MessagePane } from "@/components/chat/message-pane";
import { useParams } from "next/navigation";

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const raw = params.conversationId;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) return null;

  return (
    <ChatShell activeId={id} showList={false} showThread>
      <MessagePane conversationId={id} />
    </ChatShell>
  );
}
