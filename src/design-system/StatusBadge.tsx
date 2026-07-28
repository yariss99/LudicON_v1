type StatusTone = "saved" | "syncing" | "attention" | "neutral";

type StatusBadgeProps = {
  tone?: StatusTone;
  children: string;
};

const TONE: Record<StatusTone, string> = {
  saved: "bg-[var(--prima-secondary-soft)] text-[var(--prima-secondary)]",
  syncing: "bg-[var(--prima-primary-soft)] text-[var(--prima-primary)]",
  attention: "bg-[var(--prima-accent-soft)] text-[var(--prima-accent)]",
  neutral: "bg-slate-100 text-[var(--prima-text-muted)]",
};

function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-[var(--radius-full)] px-3 py-1 text-[var(--text-meta)] font-semibold",
        TONE[tone],
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default StatusBadge;
