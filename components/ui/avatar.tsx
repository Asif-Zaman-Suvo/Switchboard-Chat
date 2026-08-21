import { cn, initials } from "@/lib/utils";

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-line font-mono text-[11px] font-medium text-brass",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
