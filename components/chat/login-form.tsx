"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { login } from "@/lib/api/auth";
import { errorMessage } from "@/lib/api/client";
import { canonicalizePhone } from "@/lib/phone";
import { useSessionStore } from "@/stores/session-store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number")
    .max(24, "Phone is too long"),
  name: z.string().trim().min(1, "Enter your name").max(80, "Name is too long"),
});

export function LoginForm() {
  const setSession = useSessionStore((s) => s.setSession);
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<{ phone?: string; name?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    const parsed = schema.safeParse({ phone, name });
    if (!parsed.success) {
      const next: { phone?: string; name?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "phone" || key === "name") next[key] = issue.message;
      }
      setFieldError(next);
      return;
    }
    setFieldError({});
    setPending(true);
    try {
      const session = await login({
        phone: canonicalizePhone(parsed.data.phone) || parsed.data.phone,
        name: parsed.data.name,
      });
      setSession(session.token, session.user);
      router.replace("/chat");
    } catch (err) {
      setApiError(errorMessage(err, "Couldn’t sign in. The API may be waking up — try again."));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
          Phone
        </span>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+15551234567"
          autoComplete="tel"
          disabled={pending}
          data-testid="login-phone"
        />
        {fieldError.phone ? <p className="mt-1 text-xs text-signal">{fieldError.phone}</p> : null}
      </label>
      <label className="block">
        <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-mute">
          Name
        </span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
          autoComplete="name"
          disabled={pending}
          data-testid="login-name"
        />
        {fieldError.name ? <p className="mt-1 text-xs text-signal">{fieldError.name}</p> : null}
      </label>
      {apiError ? (
        <p className="text-sm text-signal" data-testid="login-error">
          {apiError}
        </p>
      ) : null}
      <Button type="submit" variant="signal" className="w-full" disabled={pending} data-testid="login-submit">
        {pending ? (
          <>
            <Spinner /> Waking the line…
          </>
        ) : (
          "Plug in"
        )}
      </Button>
      <p className="text-center text-xs text-mute">
        New numbers are registered automatically. No separate sign-up.
      </p>
    </form>
  );
}
