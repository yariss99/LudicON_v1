import { Link } from "react-router-dom";
import {
  Download,
  FileText,
  Layers,
  MonitorPlay,
  Puzzle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RecentResource } from "../../types/dashboard";
import { dashboardRo } from "../../i18n";
import SectionHeader from "../ui/SectionHeader";

const { sections, resources, resourceTypes } = dashboardRo;

const resourceIcons: Record<string, LucideIcon> = {
  [resourceTypes.flashcards]: Layers,
  [resourceTypes.presentation]: MonitorPlay,
  [resourceTypes.worksheet]: FileText,
  [resourceTypes.escapeRoom]: Puzzle,
};

type ResourceRowProps = {
  resource: RecentResource;
};

function ResourceRow({ resource }: ResourceRowProps) {
  const Icon = resourceIcons[resource.type] ?? FileText;

  return (
    <Link
      to={resource.href}
      className="group flex items-center gap-4 rounded-[24px] bg-white px-6 py-4 ring-1 ring-slate-100/70 transition-all duration-300 hover:shadow-[0_8px_28px_rgba(79,70,229,0.07)] hover:ring-indigo-100/80"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
          {resource.title}
        </p>
        <p className="text-xs text-slate-500">
          {resource.type} · {resource.format} · {resource.updatedAt}
        </p>
      </div>

      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
        aria-label={`${resources.download} ${resource.title}`}
        onClick={(e) => e.preventDefault()}
      >
        <Download size={16} />
      </button>
    </Link>
  );
}

type RecentResourcesProps = {
  resources: RecentResource[];
};

function RecentResources({ resources: resourceList }: RecentResourcesProps) {
  return (
    <section>
      <SectionHeader
        title={sections.recentResources}
        size="subtle"
        action={
          <Link
            to="/library"
            className="text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600"
          >
            {sections.openLibrary}
          </Link>
        }
      />
      <div className="space-y-3">
        {resourceList.map((resource) => (
          <ResourceRow key={resource.id} resource={resource} />
        ))}
      </div>
    </section>
  );
}

export default RecentResources;
export { ResourceRow };
