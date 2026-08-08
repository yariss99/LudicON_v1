import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { EvaluationProject } from "@ludicon/evaluation";
import { EmptyState, Skeleton } from "@ludicon/ui";

import { evaluationProjectQueries } from "../../lib/evaluation-queries";
import { paperContext, paperTitle } from "./-shared/paper-presentation";

export const Route = createFileRoute("/_studio/activity")({
  component: ActivitatePage,
});

const dayFormatter = new Intl.DateTimeFormat("ro-RO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("ro-RO", {
  hour: "2-digit",
  minute: "2-digit",
});

type DayGroup = {
  /** Stable key for the calendar day, in local time. */
  key: string;
  heading: string;
  entries: readonly EvaluationProject[];
};

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/**
 * Romanian heading for a calendar day.
 *
 * "Astăzi" and "Ieri" are how a teacher actually refers to recent work; the
 * full date only appears once the relative wording stops being useful.
 */
function headingFor(date: Date, today: Date): string {
  if (dayKey(date) === dayKey(today)) return "Astăzi";

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(date) === dayKey(yesterday)) return "Ieri";

  const formatted = dayFormatter.format(date);
  return formatted.charAt(0).toLocaleUpperCase("ro-RO") + formatted.slice(1);
}

/**
 * Groups papers into calendar days, newest first.
 *
 * The repository already sorts by `updatedAt` descending, so insertion order
 * into the map is the display order and no second sort is needed.
 */
function groupByDay(
  papers: readonly EvaluationProject[],
  today: Date,
): DayGroup[] {
  const buckets = new Map<string, EvaluationProject[]>();

  for (const paper of papers) {
    const key = dayKey(new Date(paper.updatedAt));
    const bucket = buckets.get(key);
    if (bucket) bucket.push(paper);
    else buckets.set(key, [paper]);
  }

  return [...buckets.entries()].map(([key, entries]) => {
    const first = entries[0];
    const date = first ? new Date(first.updatedAt) : today;
    return { key, heading: headingFor(date, today), entries };
  });
}

/**
 * Activity — the honest record of what the teacher touched, and when.
 *
 * Derived from `updatedAt` rather than a separate event log: there is exactly
 * one source of truth for "when did this last change", and inventing a second
 * one guarantees they drift.
 *
 * The phase badge is gone with the entity that had phases. Every row used to
 * end in a chip reading "În explorare" or "Aprobată" — five states of the
 * lesson-planning loop, none of which a paper passes through. What is left is
 * exactly what this page ever claimed to be: a time, a name, and what it is for.
 */
function ActivitatePage() {
  const papers = useQuery(evaluationProjectQueries.active());

  return (
    <div className="shell-column px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Activitate
        </h1>
        <p className="mt-1 text-muted-foreground">
          Ce ai atins în ultima vreme, zi cu zi.
        </p>
      </header>

      {papers.isPending ? (
        <ActivitySkeleton />
      ) : papers.isError ? (
        <p role="alert" className="text-muted-foreground">
          Nu am putut încărca activitatea acum. Ce ai lucrat este în siguranță —
          încearcă din nou.
        </p>
      ) : papers.data.length === 0 ? (
        <EmptyState
          title="Încă nu ai lucrat la nimic"
          explanation="Aici se adună, zi cu zi, evaluările la care te-ai întors. Începe un proiect și primul rând apare singur."
        />
      ) : (
        <div className="flex flex-col gap-10">
          {groupByDay(papers.data, new Date()).map((group) => (
            <section key={group.key} aria-labelledby={`zi-${group.key}`}>
              <h2
                id={`zi-${group.key}`}
                className="mb-4 border-b border-border pb-2 text-sm font-medium text-muted-foreground"
              >
                {group.heading}
              </h2>

              <ol className="flex flex-col gap-3">
                {group.entries.map((paper) => (
                  <li key={paper.id}>
                    <article className="flex items-start gap-4 rounded-lg bg-card p-4 ring-1 ring-border">
                      <time
                        dateTime={paper.updatedAt}
                        className="w-14 shrink-0 pt-0.5 font-mono text-[0.8125rem] text-muted-foreground"
                      >
                        {timeFormatter.format(new Date(paper.updatedAt))}
                      </time>

                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="font-medium text-card-foreground">
                          {paperTitle(paper)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {paperContext(paper)}
                        </p>
                      </div>
                    </article>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Matches the final layout: a day heading followed by three entry rows. */
function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <Skeleton className="h-5 w-32 rounded-sm" />
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-20 rounded-lg" />
    </div>
  );
}
