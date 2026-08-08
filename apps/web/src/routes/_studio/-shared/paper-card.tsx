import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Archive } from "lucide-react";
import type { EvaluationProject } from "@ludicon/evaluation";
import { cn } from "@ludicon/ui";

import {
  paperContext,
  paperShape,
  paperTitle,
  relativeUpdated,
} from "./paper-presentation";

export interface PaperCardProps {
  paper: EvaluationProject;
  /** Row of controls that must stay outside the card's link. */
  actions?: ReactNode;
  className?: string;
}

/**
 * One paper, as an object the teacher recognises.
 *
 * The title is the link and the link is stretched across the whole card, so the
 * entire surface is the target while exactly one thing lands in the tab order.
 * That is what lets an overflow menu live on the same card without nesting a
 * button inside an anchor: the menu sits above the stretched layer on its own.
 *
 * Four facts, in the order a teacher reads them: what it is, who it is for,
 * how much of it there is, when it was last touched. The card used to carry a
 * fifth — a phase badge from the lesson-planning loop — and it is gone with the
 * entity it described; `paperShape` says something true about a paper instead.
 */
export function PaperCard({ paper, actions, className }: PaperCardProps) {
  return (
    <article
      className={cn(
        "group/card relative flex h-full flex-col gap-3 rounded-lg p-5",
        "border border-border bg-card shadow-soft",
        "transition-shadow duration-[var(--motion-fast)] ease-standard",
        "hover:shadow-hover has-[a:hover]:border-border-strong",
        paper.archived && "bg-muted shadow-none",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-base leading-[1.4] font-medium text-card-foreground">
          <Link
            to="/projects/$projectId"
            params={{ projectId: paper.id }}
            className={cn(
              "cursor-pointer rounded-sm after:absolute after:inset-0 after:content-['']",
              "transition-colors duration-[var(--motion-fast)] ease-standard",
              "hover:text-primary",
            )}
          >
            {paperTitle(paper)}
          </Link>
        </h3>

        {actions ? (
          // Above the stretched link, and outside it in the DOM.
          <div className="relative z-10 -mt-1.5 -mr-1.5 shrink-0">
            {actions}
          </div>
        ) : null}
      </div>

      <p className="text-sm leading-[1.5] text-muted-foreground">
        {paperContext(paper)}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
        {paper.archived ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Archive aria-hidden strokeWidth={1.75} className="size-4" />
            Arhivată
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">
            {paperShape(paper)}
          </span>
        )}

        {/* `text-subtle` measures 2.56:1 on a white card — the token is for
            decoration, and "when did I last touch this" is the question this
            list exists to answer. */}
        <time
          dateTime={paper.updatedAt}
          className="text-sm text-muted-foreground tabular-nums"
        >
          {relativeUpdated(paper.updatedAt)}
        </time>
      </div>
    </article>
  );
}
