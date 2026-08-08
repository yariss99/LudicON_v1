import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@ludicon/ui";

export const Route = createFileRoute("/_studio/calendar")({
  component: CalendarPage,
});

/**
 * Not yet migrated. Rendering an honest state beats a convincing shell that
 * implies working functionality — see REFACTOR_STATUS.md.
 */
function CalendarPage() {
  return (
    <div className="shell-column px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-foreground">
        Calendar
      </h1>
      <EmptyState
        title="Secțiunea se reconstruiește"
        explanation="Aici va apărea planificarea pe săptămâni și semestre. Această parte a atelierului este în curs de mutare pe noua structură."
      />
    </div>
  );
}
