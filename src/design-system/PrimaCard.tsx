import type { HTMLAttributes, ReactNode } from "react";

type PrimaCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "sm" | "md" | "lg";
  interactive?: boolean;
};

const PAD = {
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
} as const;

function PrimaCard({
  children,
  padding = "md",
  interactive,
  className = "",
  ...rest
}: PrimaCardProps) {
  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] bg-[var(--prima-surface)] shadow-[var(--shadow-soft)] ring-1 ring-[var(--prima-border)]",
        PAD[padding],
        interactive
          ? "transition-shadow duration-[var(--prima-motion)] hover:shadow-[var(--shadow-hover)]"
          : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export default PrimaCard;
