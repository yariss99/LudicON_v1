import { useState, type DragEvent } from "react";
import type { ProjectResource } from "../../../types/project";
import ResourceCard from "./ResourceCard";

type LivingCanvasProps = {
  projectId: string;
  resources: ProjectResource[];
  onOpenResource: (resource: ProjectResource) => void;
  onReorder: (resources: ProjectResource[]) => void;
  onRenameResource?: (resourceId: string, label: string) => void;
};

function LivingCanvas({
  projectId,
  resources,
  onOpenResource,
  onReorder,
  onRenameResource,
}: LivingCanvasProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const onDragStart = (event: DragEvent, id: string) => {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const onDrop = (event: DragEvent, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggingId;
    setDraggingId(null);
    if (!sourceId || sourceId === targetId) return;

    const next = [...resources];
    const from = next.findIndex((item) => item.id === sourceId);
    const to = next.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  return (
    <div className="living-canvas relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(246,247,249,0.9))] p-4 sm:p-6">
      <div
        className="living-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />

      <div className="relative mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Living workspace
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Everything connected. Drag to rearrange. Click Game or rename the
          Worksheet — it feels alive.
        </p>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource, index) => (
          <div
            key={resource.id}
            draggable={!resource.id.includes("editing")}
            onDragStart={(event) => onDragStart(event, resource.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDrop(event, resource.id)}
            onDragEnd={() => setDraggingId(null)}
            className={[
              "living-card-grow relative transition-all duration-300",
              draggingId === resource.id ? "scale-[0.98] opacity-60" : "",
            ].join(" ")}
            style={{ animationDelay: `${90 + index * 70}ms` }}
          >
            <ResourceCard
              projectId={projectId}
              resource={resource}
              onOpen={onOpenResource}
              onRename={onRenameResource}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LivingCanvas;
