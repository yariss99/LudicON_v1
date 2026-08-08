import {
  Archive,
  BookOpen,
  Check,
  Eye,
  History,
  Pencil,
  type LucideIcon,
} from "lucide-react";

import { Badge, type BadgeProps } from "../badge";

/**
 * Mirrors `LifecycleStatus` in `@ludicon/domain`.
 *
 * Declared locally rather than imported: the UI package has no domain
 * dependency and should not grow one for six string literals. The union is
 * kept identical on purpose — if the domain adds a state, this fails to
 * compile at the call site rather than rendering a blank chip.
 */
export type LifecycleStatus =
  "draft" | "needs_review" | "ready" | "published" | "archived" | "superseded";

interface StatusPresentation {
  label: string;
  icon: LucideIcon;
  tone: NonNullable<BadgeProps["tone"]>;
}

/**
 * Colour, icon and words — all three, always.
 *
 * CH07 forbids colour-only meaning outright, so nothing here is distinguished
 * by hue alone. Labels come from the canonical Romanian list in UX-001 where
 * one exists; `ready`, `published`, `archived` and `superseded` had no
 * documented string and are written in the same register.
 *
 * Note that nothing is red. `superseded` and `archived` are outcomes of a
 * healthy workflow, not failures — red is reserved for true errors (CH01 §4).
 */
const PRESENTATION: Record<LifecycleStatus, StatusPresentation> = {
  draft: { label: "În lucru", icon: Pencil, tone: "neutral" },
  needs_review: { label: "De revăzut", icon: Eye, tone: "warning" },
  ready: { label: "Gata de publicare", icon: Check, tone: "info" },
  published: { label: "Publicată", icon: BookOpen, tone: "success" },
  archived: { label: "Arhivată", icon: Archive, tone: "neutral" },
  superseded: { label: "Înlocuită", icon: History, tone: "neutral" },
};

export interface StatusBadgeProps extends Omit<
  BadgeProps,
  "tone" | "icon" | "children"
> {
  status: LifecycleStatus;
  /** Override the default Romanian label when a surface needs a longer form. */
  label?: string;
}

export function StatusBadge({ status, label, ...props }: StatusBadgeProps) {
  const presentation = PRESENTATION[status];
  const Icon = presentation.icon;

  return (
    <Badge
      tone={presentation.tone}
      icon={<Icon aria-hidden strokeWidth={1.75} />}
      data-status={status}
      {...props}
    >
      {label ?? presentation.label}
    </Badge>
  );
}

/** Exposed for filter menus and legends that need to list every state. */
export const LIFECYCLE_STATUS_LABELS: Record<LifecycleStatus, string> = {
  draft: PRESENTATION.draft.label,
  needs_review: PRESENTATION.needs_review.label,
  ready: PRESENTATION.ready.label,
  published: PRESENTATION.published.label,
  archived: PRESENTATION.archived.label,
  superseded: PRESENTATION.superseded.label,
};
