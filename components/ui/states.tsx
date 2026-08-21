export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="font-serif text-lg text-paper">{title}</p>
      {body ? <p className="mt-1 text-sm text-mute">{body}</p> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-sm text-signal">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm text-brass underline underline-offset-4"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-line bg-[#1a120c] px-3 py-2 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
      {children}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-sm bg-line ${className ?? "h-10"}`} />;
}
