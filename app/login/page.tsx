"use client";

import { LoginForm } from "@/components/chat/login-form";
import { useSession } from "@/hooks/use-session";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { token, ready } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (ready && token) router.replace("/chat");
  }, [ready, token, router]);

  if (!ready || token) {
    return (
      <div className="flex h-dvh items-center justify-center bg-ink text-brass">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ink">
      <header className="flex items-center justify-between px-5 py-5">
        <Link href="/" className="font-mono text-[11px] uppercase tracking-[0.28em] text-brass">
          Switchboard
        </Link>
      </header>
      <motion.main
        className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-signal">Operator desk</p>
        <h1 className="mt-3 font-serif text-4xl text-paper">Plug into the board.</h1>
        <p className="mt-2 mb-8 text-sm text-mute">
          Phone + name. Local numbers like 015… are stored as +88015…. Same digits, one account.
        </p>
        <LoginForm />
      </motion.main>
    </div>
  );
}
