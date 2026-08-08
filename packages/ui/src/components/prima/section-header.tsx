import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

export interface SectionHeaderProps {
  title: string;
  /**
   * One sentence of support. Not a paragraph, not a tooltip in disguise.
   * Leave it out when the title is already obvious — CH02 Law 2 is silence.
   */
  supporting?: string;
  /**
   * The single action for this section.
   *
   * Typed as one node rather than a list on purpose: CH02 Law 1 allows one
   * dominant action, and a header that grows a toolbar is how a 40-tool ribbon
   * starts (CH12 anti-pattern).
   */
  action?: ReactNode;
  /** `2` by default; drop to `3` when the section nests under another. */
  headingLevel?: 2 | 3;
  /** Wire to the region's `aria-labelledby`. */
  id?: string;
  className?: string;
}

const titleClass = "text-xl font-semibold leading-[1.3] text-strong";

/** Title, one supporting line, one action. */
export function SectionHeader({
  title,
  supporting,
  action,
  headingLevel = 2,
  id,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">
        {headingLevel === 3 ? (
          <h3 id={id} className={titleClass}>
            {title}
          </h3>
        ) : (
          <h2 id={id} className={titleClass}>
            {title}
          </h2>
        )}
        {supporting ? (
          <p className="max-w-[65ch] text-base leading-[1.6] text-muted-foreground">
            {supporting}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
