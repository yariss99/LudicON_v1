import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  size?: "default" | "large" | "subtle";
};

function SectionHeader({
  title,
  subtitle,
  action,
  size = "default",
}: SectionHeaderProps) {
  const titleClass =
    size === "large"
      ? "text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
      : size === "subtle"
        ? "text-lg font-medium tracking-tight text-slate-700"
        : "text-xl font-semibold tracking-tight text-slate-900";

  const marginClass = size === "subtle" ? "mb-8" : "mb-8";

  return (
    <div
      className={`${marginClass} flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between`}
    >
      <div>
        <h2 className={titleClass}>{title}</h2>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="mt-2 shrink-0 sm:mt-0">{action}</div>}
    </div>
  );
}

export default SectionHeader;
