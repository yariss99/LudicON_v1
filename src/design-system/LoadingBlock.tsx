type LoadingBlockProps = {
  rows?: number;
  label?: string;
};

function LoadingBlock({
  rows = 3,
  label = "Pregătim informațiile lecției…",
}: LoadingBlockProps) {
  return (
    <div className="space-y-3" aria-busy aria-label={label}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-[var(--radius-md)] bg-slate-200/70"
          style={{ width: `${92 - index * 8}%` }}
        />
      ))}
      <p className="text-center text-[var(--text-meta)] text-[var(--prima-text-muted)]">
        {label}
      </p>
    </div>
  );
}

export default LoadingBlock;
