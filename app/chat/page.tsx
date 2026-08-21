"use client";

import { ChatShell } from "@/components/chat/chat-shell";

export default function ChatIndexPage() {
  return (
    <ChatShell showList showThread={false}>
      <div className="hidden flex-1 items-center justify-center md:flex">
        <div className="max-w-sm px-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brass">Idle circuit</p>
          <h1 className="mt-3 font-serif text-3xl text-paper">Pick a line, or open a new one.</h1>
          <p className="mt-2 text-sm text-mute">
            Search by name or phone. Groups need a name and at least two other people.
          </p>
        </div>
      </div>
    </ChatShell>
  );
}
