import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[var(--text-title)] font-semibold tracking-tight text-[var(--prima-text)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[var(--text-body)] text-[var(--prima-text-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export default SectionHeader;
