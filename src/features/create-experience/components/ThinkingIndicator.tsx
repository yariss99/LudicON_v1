type ThinkingIndicatorProps = {
  label: string;
};

function ThinkingIndicator({ label }: ThinkingIndicatorProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100"
      role="status"
      aria-live="polite"
    >
      <span className="flex gap-1" aria-hidden>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:240ms]" />
      </span>
      <span>{label}</span>
    </div>
  );
}

export default ThinkingIndicator;
