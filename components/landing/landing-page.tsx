"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-ink text-paper">
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#e4b84a_1px,transparent_1px),linear-gradient(to_bottom,#e4b84a_1px,transparent_1px)] [background-size:48px_48px]"
        animate={{ backgroundPosition: ["0px 0px", "48px 48px"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      />
      <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brass">Switchboard</p>
        <Link
          href="/login"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute hover:text-paper"
        >
          Operator login
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-24 md:px-10">
        <section className="grid gap-12 border-b border-line py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.p variants={fadeUp} className="font-mono text-[11px] uppercase tracking-[0.28em] text-signal">
              Live operator console
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] tracking-tight text-paper md:text-7xl"
            >
              Every conversation on one brass line.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-md text-base leading-relaxed text-mute">
              Search a person. Open a private line or a group circuit. Messages land without a
              refresh. Built against a real chat API — not a canned demo.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/login"
                  className="inline-block bg-signal px-5 py-3 text-sm font-medium text-paper hover:bg-[#ff7440]"
                  data-testid="cta-start-chatting"
                >
                  Start chatting
                </Link>
              </motion.div>
              <motion.a
                href="https://frontend-task-chatapp.onrender.com/docs/"
                target="_blank"
                rel="noreferrer"
                className="border border-line px-5 py-3 text-sm text-mute hover:border-brass hover:text-brass"
                whileHover={{ y: -2 }}
              >
                API docs
              </motion.a>
            </motion.div>
          </motion.div>
          <PreviewPanel />
        </section>

        <section className="grid gap-px border-b border-line bg-line py-0 md:grid-cols-3">
          {[
            {
              k: "01",
              t: "Find anyone",
              d: "Search by name or phone. A new number registers itself on first plug-in.",
            },
            {
              k: "02",
              t: "Private and group",
              d: "One-to-one lines, or a named group with three or more operators.",
            },
            {
              k: "03",
              t: "Live delivery",
              d: "Socket.io pushes incoming messages. Scroll up to read history without being yanked back.",
            },
          ].map((item, i) => (
            <motion.article
              key={item.k}
              className="bg-ink p-6 md:p-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: i * 0.08, ease }}
              whileHover={{ backgroundColor: "#161410" }}
            >
              <p className="font-mono text-[11px] text-brass">{item.k}</p>
              <h2 className="mt-3 font-serif text-2xl">{item.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">{item.d}</p>
            </motion.article>
          ))}
        </section>

        <section className="grid gap-10 py-16 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="font-serif text-3xl md:text-4xl">The panel is the product.</h2>
            <p className="mt-4 text-sm leading-relaxed text-mute">
              Own messages sit on the brass side. Incoming on the dark side. Failed sends stay in
              the thread with a retry. If the hosted API sleeps, the console says so instead of
              pretending the line is live.
            </p>
          </motion.div>
          <ul className="space-y-3 font-mono text-xs text-mute">
            {[
              "JWT session restored via GET /auth/me",
              "Cursor pagination for older transcripts",
              "Reconnect catch-up after a dropped socket",
            ].map((line, i) => (
              <motion.li
                key={line}
                className="border border-line px-4 py-3"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease }}
              >
                {line}
              </motion.li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="relative z-10 border-t border-line px-5 py-6 font-mono text-[11px] uppercase tracking-[0.18em] text-mute md:px-10">
        Switchboard · take-home console · not a SaaS template
      </footer>
    </div>
  );
}

function PreviewPanel() {
  return (
    <motion.div
      className="border border-line bg-[#100f0c] shadow-[12px_12px_0_0_#2a2620]"
      initial={{ opacity: 0, y: 24, rotate: 1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease, delay: 0.15 }}
      whileHover={{ y: -6, rotate: -0.4, transition: { duration: 0.3 } }}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mute">
        <span>Circuit 14 · Ada</span>
        <span className="inline-flex items-center gap-1.5 text-brass">
          <motion.span
            className="inline-block h-1.5 w-1.5 rounded-full bg-brass"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          Live
        </span>
      </div>
      <div className="space-y-3 p-4">
        <Bubble mine={false} who="Ada" when="9:14" delay={0.35} text="The line is open. Did the patch land?" />
        <Bubble mine who="You" when="9:14" delay={0.55} text="Yes. Incoming messages now stick only if you’re at the bottom." />
        <Bubble mine={false} who="Ada" when="9:15" delay={0.75} text="That’s the whole job." />
      </div>
      <div className="flex gap-2 border-t border-line p-3">
        <div className="h-9 flex-1 border border-line bg-ink px-3 py-2 font-mono text-[11px] text-mute">
          Transmit…
        </div>
        <div className="bg-signal px-3 py-2 text-xs text-paper">Send</div>
      </div>
    </motion.div>
  );
}

function Bubble({
  mine,
  who,
  when,
  text,
  delay,
}: {
  mine: boolean;
  who: string;
  when: string;
  text: string;
  delay: number;
}) {
  return (
    <motion.div
      className={mine ? "ml-8" : "mr-8"}
      initial={{ opacity: 0, y: 10, x: mine ? 12 : -12 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4, delay, ease }}
    >
      <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-mute">
        {who} · {when}
      </p>
      <p className={mine ? "bg-brass px-3 py-2 text-sm text-ink" : "border border-line px-3 py-2 text-sm"}>
        {text}
      </p>
    </motion.div>
  );
}
