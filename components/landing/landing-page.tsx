"use client";

import { PreviewPanel } from "@/components/landing/preview-panel";
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
              Search a person. Open a private line or a group circuit. Try the demo pane on the
              right — same scroll contract as the real thread. Then plug into the live API.
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

