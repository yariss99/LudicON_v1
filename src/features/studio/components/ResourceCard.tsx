import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Gamepad2,
  LayoutTemplate,
  NotebookPen,
  Presentation,
  Puzzle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ProjectResource, ProjectResourceType } from "../../../types/project";

const icons: Record<ProjectResourceType, LucideIcon> = {
  blueprint: LayoutTemplate,
  lesson: BookOpen,
  activities: Puzzle,
  worksheet: FileText,
  assessment: ClipboardCheck,
  presentation: Presentation,
  game: Gamepad2,
  story: BookOpen,
  notes: NotebookPen,
  reflection: Sparkles,
  resources: FolderOpen,
  ai_notes: Sparkles,
};

const statusCopy = {
  ready: "Ready",
  draft: "Draft ready",
  empty: "Add content",
} as const;

type ResourceCardProps = {
  projectId: string;
  resource: ProjectResource;
  onOpen: (resource: ProjectResource) => void;
  onRename?: (resourceId: string, label: string) => void;
};

function ResourceCard({ resource, onOpen, onRename }: ResourceCardProps) {
  const Icon = icons[resource.type];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(resource.label);

  useEffect(() => {
    setDraft(resource.label);
  }, [resource.label]);

  const canEditTitle =
    Boolean(onRename) &&
    (resource.type === "worksheet" || resource.type === "game");

  return (
    <div className="studio-card-enter group h-full rounded-[24px] border border-slate-200/80 bg-white p-6 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
      <div className="mb-8 flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onOpen(resource)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white"
          aria-label={`Open ${resource.label}`}
        >
          <Icon size={22} strokeWidth={1.75} />
        </button>
        <span
          className={[
            "rounded-full px-2.5 py-1 text-xs font-medium",
            resource.status === "ready"
              ? "bg-emerald-50 text-emerald-700"
              : resource.status === "draft"
                ? "bg-amber-50 text-amber-800"
                : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {statusCopy[resource.status]}
        </span>
      </div>

      {editing && canEditTitle ? (
        <input
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            setEditing(false);
            onRename?.(resource.id, draft);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setEditing(false);
              onRename?.(resource.id, draft);
            }
            if (event.key === "Escape") {
              setDraft(resource.label);
              setEditing(false);
            }
          }}
          className="w-full rounded-xl border border-blue-200 bg-blue-50/40 px-3 py-2 text-lg font-semibold tracking-tight text-slate-900 outline-none focus:ring-4 focus:ring-blue-100"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            if (canEditTitle) {
              setEditing(true);
              return;
            }
            onOpen(resource);
          }}
          className="block w-full border-0 bg-transparent p-0 text-left"
        >
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {resource.label}
          </h3>
        </button>
      )}

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {resource.type === "game" && resource.status === "ready"
          ? "Activity selected — ready for the classroom."
          : resource.status === "empty"
            ? "Placeholder ready — open to shape this resource."
            : canEditTitle
              ? "Click the title to rename. Open to shape."
              : "PRIMA prepared a starting point. Edit anytime."}
      </p>

      <button
        type="button"
        onClick={() => onOpen(resource)}
        className="mt-6 text-sm font-medium text-slate-800 transition-colors hover:text-blue-700"
      >
        Open →
      </button>
    </div>
  );
}

export default ResourceCard;
