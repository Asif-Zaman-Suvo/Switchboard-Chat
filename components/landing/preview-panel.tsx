"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;
const THRESHOLD = 72;

type DemoMsg = { id: string; mine: boolean; who: string; text: string; at: string };

const SEED: DemoMsg[] = [
  {
    id: "s1",
    mine: false,
    who: "Ada",
    text: "The line is open. Did the patch land?",
    at: "9:14",
  },
  {
    id: "s2",
    mine: true,
    who: "You",
    text: "Yes. Incoming messages now stick only if you’re at the bottom.",
    at: "9:14",
  },
  {
    id: "s3",
    mine: false,
    who: "Ada",
    text: "That’s the whole job. Try sending below — this isn’t a screenshot.",
    at: "9:15",
  },
];

const ADA_SCRIPT = [
  "Scroll this pane up. I will wait. I will not yank you down.",
  "That’s the same contract as the real thread.",
  "Type in Transmit. Empty lines don’t send.",
  "Still here. Plug in when you want a real circuit.",
];

function clock() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function PreviewPanel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<DemoMsg[]>(SEED);
  const [draft, setDraft] = useState("");
  const [stuck, setStuck] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const [scriptIdx, setScriptIdx] = useState(0);
  const stuckRef = useRef(true);
  const scriptIdxRef = useRef(0);

  stuckRef.current = stuck;
  scriptIdxRef.current = scriptIdx;

  const isNearBottom = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    setStuck(true);
    setUnseen(0);
  }, []);

  const push = useCallback(
    (msg: Omit<DemoMsg, "id" | "at">) => {
      setMessages((list) => [
        ...list,
        { ...msg, id: crypto.randomUUID(), at: clock() },
      ]);
      if (stuckRef.current) {
        requestAnimationFrame(() => scrollToBottom(false));
      } else {
        setUnseen((n) => n + 1);
      }
    },
    [scrollToBottom],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!stuckRef.current) return;
      const i = scriptIdxRef.current;
      if (i >= ADA_SCRIPT.length) return;
      push({ mine: false, who: "Ada", text: ADA_SCRIPT[i] });
      setScriptIdx(i + 1);
    }, 4200);
    return () => window.clearInterval(id);
  }, [push]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setStuck(true);
    push({ mine: true, who: "You", text });
    window.setTimeout(() => {
      if (!stuckRef.current) return;
      push({
        mine: false,
        who: "Ada",
        text: "Received on the demo line. The real board is behind Start chatting.",
      });
    }, 900);
  };

  return (
    <motion.div
      className="border border-line bg-[#100f0c] shadow-[12px_12px_0_0_#2a2620]"
      initial={{ opacity: 0, y: 24, rotate: 1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease, delay: 0.15 }}
      data-testid="landing-preview"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
        <span>Circuit 14 · Ada · demo</span>
        <span className="inline-flex items-center gap-1.5 text-brass">
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-brass"
            animate={{ opacity: stuck ? [1, 0.25, 1] : 1 }}
            transition={{ duration: 1.6, repeat: stuck ? Infinity : 0 }}
          />
          {stuck ? "Live" : "Paused"}
        </span>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={() => {
            const near = isNearBottom();
            setStuck(near);
            if (near) setUnseen(0);
          }}
          className="h-56 space-y-3 overflow-y-auto p-4"
        >
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                className={m.mine ? "ml-8" : "mr-8"}
                initial={{ opacity: 0, y: 8, x: m.mine ? 10 : -10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ duration: 0.28, ease }}
              >
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-mute">
                  {m.who} · {m.at}
                </p>
                <p
                  className={
                    m.mine
                      ? "bg-brass px-3 py-2 text-sm text-ink"
                      : "border border-line px-3 py-2 text-sm"
                  }
                >
                  {m.text}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {!stuck && unseen > 0 ? (
          <button
            type="button"
            data-testid="preview-new-messages"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 border border-brass bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-brass"
          >
            New messages ({unseen})
          </button>
        ) : null}
      </div>

      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Transmit…"
          data-testid="preview-composer"
          className={cn(
            "h-9 flex-1 border border-line bg-ink px-3 text-sm text-paper outline-none placeholder:text-mute focus:border-brass",
          )}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          data-testid="preview-send"
          className="bg-signal px-3 py-2 text-xs text-paper disabled:opacity-40"
        >
          Send
        </button>
      </form>
      <p className="px-3 pb-3 font-mono text-[10px] text-mute">
        Local demo. Same scroll rule as /chat — Ada pauses if you read up.
      </p>
    </motion.div>
  );
}
