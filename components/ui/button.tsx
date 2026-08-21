import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "signal" | "paper";
};

export function Button({ className, variant = "primary", type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-medium tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-brass text-ink hover:bg-[#f0c45c]",
        variant === "signal" && "bg-signal text-paper hover:bg-[#ff7440]",
        variant === "paper" && "bg-paper text-ink hover:bg-white",
        variant === "ghost" && "border border-line bg-transparent text-paper hover:border-brass hover:text-brass",
        className,
      )}
      {...props}
    />
  );
}
