import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@ludicon/ui";

export const Route = createFileRoute("/_studio/notifications")({
  component: NotificriPage,
});

/**
 * Not yet migrated. Rendering an honest state beats a convincing shell that
 * implies working functionality — see REFACTOR_STATUS.md.
 */
function NotificriPage() {
  return (
    <div className="shell-column px-6 py-10">
      <h1 className="mb-6 font-display text-2xl font-semibold text-foreground">
        Notificări
      </h1>
      <EmptyState
        title="Secțiunea se reconstruiește"
        explanation="Aici va apărea anunțurile despre proiectele tale. Această parte a atelierului este în curs de mutare pe noua structură."
      />
    </div>
  );
}
