type PrimaMarkProps = {
  size?: number;
  pulse?: boolean;
  className?: string;
  title?: string;
};

/**
 * DESIGN-001 — Guiding Star identity mark.
 * Calm compass-light: recognizable without reading “PRIMA”.
 */
function PrimaMark({
  size = 28,
  pulse = true,
  className = "",
  title = "PRIMA",
}: PrimaMarkProps) {
  return (
    <span
      className={["relative inline-flex items-center justify-center", className].join(
        " ",
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={title}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect
          x="10"
          y="10"
          width="12"
          height="12"
          rx="2.5"
          transform="rotate(45 16 16)"
          fill="var(--prima-primary)"
          fillOpacity="0.92"
        />
        <rect
          x="12.5"
          y="12.5"
          width="7"
          height="7"
          rx="1.5"
          transform="rotate(45 16 16)"
          fill="var(--prima-surface)"
          fillOpacity="0.95"
        />
        <circle
          cx="16"
          cy="16"
          r="2.2"
          fill="var(--prima-accent)"
          fillOpacity="0.85"
          className={pulse ? "prima-mark-pulse" : undefined}
        />
      </svg>
    </span>
  );
}

export default PrimaMark;
