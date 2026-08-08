import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { EvaluationProject } from "@ludicon/evaluation";
import { EmptyState, SectionHeader, Skeleton, cn } from "@ludicon/ui";

import { PaperCard } from "../-shared/paper-card";

export interface ContinueStripProps {
  papers: readonly EvaluationProject[];
  isPending: boolean;
}

/**
 * The link that takes a section's row to its full page.
 *
 * The union is down to one member, which looks like a parameter that should not
 * exist. It is kept because the alternative is hard-coding the destination
 * inside a component named after the general case, and the desk has had two
 * shelves before and will again. `Bibliotecă` was the second one; it listed a
 * collection nothing writes any more and was removed rather than filled.
 */
export function SeeAllLink({
  to,
  children,
}: {
  to: "/projects";
  children: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-sm px-1",
        "text-sm font-medium text-muted-foreground",
        "transition-colors duration-[var(--motion-fast)] ease-standard",
        "hover:text-primary",
      )}
    >
      {children}
      <ArrowRight aria-hidden strokeWidth={1.75} className="size-4" />
    </Link>
  );
}

/**
 * The evaluations the teacher already has open.
 *
 * This is the shortest path back into real work, so it sits above everything
 * else on the page and its cards are the same cards the projects page uses —
 * a paper should not change shape depending on which room you meet it in.
 */
export function ContinueStrip({ papers, isPending }: ContinueStripProps) {
  return (
    <section aria-labelledby="continua-lucrul">
      <SectionHeader
        id="continua-lucrul"
        title="Continuă lucrul"
        supporting="Ultimele evaluări la care ai lucrat."
        action={
          papers.length > 0 ? (
            <SeeAllLink to="/projects">Toate proiectele</SeeAllLink>
          ) : undefined
        }
      />

      {isPending ? (
        <div
          className="mt-4 grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3"
          aria-hidden
        >
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      ) : papers.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="Nu ai proiecte începute"
          explanation="Aici revin evaluările la care lucrezi, ca să le poți relua de unde ai rămas. Începe cu butonul de mai sus."
        />
      ) : (
        <ul className="mt-4 grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
          {papers.map((paper) => (
            <li key={paper.id}>
              <PaperCard paper={paper} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
