import { motion } from "framer-motion";
import { formatRelativeTime } from "../../../utils/date";
import type { WorkspaceResourceItem } from "../services/workspaceInventory";
import { projectWorkspaceRepository } from "../services/projectWorkspaceRepository";

const KIND_EVENT: Record<string, string> = {
  lesson: "Lesson created",
  worksheet: "Worksheet created",
  assessment: "Assessment created",
  presentation: "Presentation created",
  game: "Game created",
  story: "Story created",
};

type TimelineEvent = {
  id: string;
  title: string;
  detail: string;
  at: string;
};

type Props = {
  projectId: string;
  inventory: WorkspaceResourceItem[];
};

export function ProjectTimeline({ projectId, inventory }: Props) {
  const studioEvents: TimelineEvent[] = inventory.map((item) => ({
    id: `studio-${item.kind}-${item.id}`,
    title: KIND_EVENT[item.kind] ?? "Resource created",
    detail: item.title,
    at: item.createdAt,
  }));

  const workspaceEvents: TimelineEvent[] = projectWorkspaceRepository
    .listActivity(projectId)
    .slice(0, 20)
    .map((e) => ({
      id: e.id,
      title: e.title,
      detail: e.detail,
      at: e.timestamp,
    }));

  const events = [...studioEvents, ...workspaceEvents]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 12);

  return (
    <section aria-labelledby="project-timeline">
      <h3
        id="project-timeline"
        className="mb-3 text-lg font-semibold tracking-tight text-slate-900"
      >
        Project timeline
      </h3>
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Timeline events will appear as you create resources.
        </div>
      ) : (
        <ol className="relative space-y-0 border-l border-slate-200 pl-4">
          {events.map((event, index) => (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="relative pb-4 last:pb-0"
            >
              <span className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-900 ring-4 ring-white" />
              <p className="text-sm font-semibold text-slate-900">
                {event.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{event.detail}</p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.06em] text-slate-400">
                {formatRelativeTime(event.at)}
              </p>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}
