import { Link } from "@tanstack/react-router";
import { cn } from "@ludicon/ui";
import type { EvaluationProject } from "@ludicon/evaluation";

import { paperTitle } from "../../routes/_studio/-shared/paper-presentation";

const GROUP_LABEL = "Recente";

export interface NavRecentsProps {
  papers: readonly EvaluationProject[];
  pathname: string;
  onNavigate?: () => void;
}

/**
 * The last few lessons the teacher touched.
 *
 * This is the one thing in the rail that is about the teacher's work rather
 * than about the product's structure, and it is why the rail stops feeling
 * like a site map. Every row is a real paper, read through the same
 * `queryOptions` the projects page uses — and it now opens: these links used to
 * carry a `@ludicon/domain` `ProjectId` into a route that resolves evaluation
 * papers, so every one of them landed on "nu găsim proiectul".
 *
 * Nothing renders when there is nothing to show. A new teacher already meets
 * an empty state on the desk — `Nu ai proiecte începute` — and repeating it in
 * the rail would be the product apologising twice for the same silence. The
 * honest empty state here is absence.
 *
 * Hidden when the rail is collapsed: a 72px column cannot carry a lesson title,
 * and three unlabelled dots would be decoration pretending to be information.
 */
export function NavRecents({ papers, pathname, onNavigate }: NavRecentsProps) {
  if (papers.length === 0) return null;

  return (
    <div className="pt-6">
      <div className="px-3 pb-2 text-[0.75rem] leading-[1.4] font-semibold tracking-[0.02em] text-muted-foreground">
        {GROUP_LABEL}
      </div>

      <ul aria-label={GROUP_LABEL} className="flex flex-col gap-0.5">
        {papers.map((paper) => {
          const href = `/projects/${paper.id}`;
          const active = pathname === href;

          return (
            <li key={paper.id}>
              <Link
                to="/projects/$projectId"
                params={{ projectId: paper.id }}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-full pr-3 pl-3.5",
                  "text-[0.9375rem] leading-[1.4]",
                  "transition-colors duration-[var(--motion-fast)] ease-standard",
                  active
                    ? "bg-primary-soft font-semibold text-primary"
                    : "font-normal text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {/* A dot, not a coloured tag. Six hues down the side of a rail
                    is the rainbow status CH12 rules out, and it would encode
                    nothing the title does not already say. */}
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    active ? "bg-primary" : "bg-subtle",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">
                  {paperTitle(paper)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
