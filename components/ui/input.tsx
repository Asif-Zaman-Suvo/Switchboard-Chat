import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-sm border border-line bg-ink px-3 py-2.5 text-sm text-paper outline-none placeholder:text-mute focus:border-brass",
        className,
      )}
      {...props}
    />
  );
}
