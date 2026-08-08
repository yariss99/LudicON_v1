import { createFileRoute } from "@tanstack/react-router";

import { ContinueStrip } from "./-desk/continue-strip";
import { DeskHero } from "./-desk/desk-hero";
import { Shelves } from "./-desk/shelves";
import { useDesk } from "./-desk/use-desk";

export const Route = createFileRoute("/_studio/")({
  component: TeacherDesk,
});

/**
 * Teacher Desk — "Biroul meu".
 *
 * Two zones, and the split is the whole design.
 *
 * The first viewport carries a greeting, one supporting line, one primary
 * action, the evaluations already open, and PRIMA saying in a sentence what it
 * does. Nothing else. No counters, no KPI row, no schedule widget — a teacher
 * opening this before first period needs a way in, not a dashboard reporting on
 * them.
 *
 * Below the fold the page widens into the workshop. It is one section now where
 * it was four, and the three that went were not trimmed for calm — they were
 * reading `Project.state` and `resources`, one a vocabulary this product no
 * longer has and the other a collection nothing writes. See `-desk/use-desk.ts`;
 * this page is short because the honest answer is short, and it grows back the
 * moment a paper has something more to say about itself.
 */
function TeacherDesk() {
  const desk = useDesk();

  return (
    <div className="shell-column px-6 pt-10 pb-20">
      <DeskHero />

      <div className="mt-12">
        <ContinueStrip papers={desk.continueWith} isPending={desk.isPending} />
      </div>

      {desk.isError ? (
        <p role="alert" className="mt-12 text-muted-foreground">
          Nu am putut încărca biroul acum. Ce ai lucrat este în siguranță —
          încearcă din nou peste câteva momente.
        </p>
      ) : desk.isPending || desk.isEmpty ? null : (
        <div className="mt-16 border-t border-border pt-16">
          <Shelves shelves={desk.shelves} />
        </div>
      )}
    </div>
  );
}
