import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@ludicon/ui";

export const Route = createFileRoute("/_studio/settings")({
  component: SetriPage,
});

/**
 * Not yet migrated. Rendering an honest state beats a convincing shell that
 * implies working functionality — see REFACTOR_STATUS.md.
 */
function SetriPage() {
  return (
    <div className="shell-column px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-foreground">
        Setări
      </h1>
      <EmptyState
        title="Secțiunea se reconstruiește"
        explanation="Aici va apărea preferințele contului și ale atelierului. Această parte a atelierului este în curs de mutare pe noua structură."
      />
    </div>
  );
}
