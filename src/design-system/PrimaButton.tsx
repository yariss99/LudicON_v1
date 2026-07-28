import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type PrimaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PrimaButtonVariant;
  children: ReactNode;
};

const VARIANT: Record<PrimaButtonVariant, string> = {
  primary:
    "bg-[var(--prima-primary)] text-white hover:bg-[var(--prima-primary-hover)] shadow-sm",
  secondary:
    "bg-[var(--prima-surface)] text-[var(--prima-text)] ring-1 ring-[var(--prima-border)] hover:bg-slate-50",
  ghost: "bg-transparent text-[var(--prima-text-muted)] hover:bg-slate-100/80",
  danger:
    "bg-[var(--prima-danger-soft)] text-[var(--prima-danger)] ring-1 ring-red-100 hover:bg-red-100/80",
};

function PrimaButton({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: PrimaButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-full)] px-5 py-2.5 text-sm font-semibold transition-all duration-[var(--prima-motion)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
        VARIANT[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}

export default PrimaButton;
