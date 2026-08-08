import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { ProjectDashboardHero } from "../components/ProjectDashboardHero";
import { ResourceSummaryCard } from "../components/ResourceSummaryCard";
import { RecentActivitySection } from "../components/RecentActivitySection";
import { ProjectTimeline } from "../components/ProjectTimeline";
import { WorkspaceSearch } from "../components/WorkspaceSearch";
import { WorkspaceCopilotPanel } from "../components/WorkspaceCopilotPanel";
import { computeDynamicProgress } from "../services/dynamicProgress";
import {
  buildWorkspaceInventory,
  filterInventory,
  summarizeByKind,
  type WorkspaceResourceKind,
} from "../services/workspaceInventory";
import { buildWorkspaceRecommendations } from "../services/workspaceRecommendations";

/**
 * Dynamic Project Workspace dashboard — operational hub (Mission 003).
 */
export function OverviewTab() {
  const { project } = useProjectWorkspace();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<WorkspaceResourceKind | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener("focus", refresh);
    window.addEventListener("prima:artifacts-changed", refresh);
    const id = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("prima:artifacts-changed", refresh);
      window.clearInterval(id);
    };
  }, []);

  const inventory = useMemo(() => {
    void tick;
    return buildWorkspaceInventory(project.id);
  }, [project.id, tick]);

  const progress = useMemo(
    () => computeDynamicProgress(project.id, inventory),
    [project.id, inventory],
  );

  const summaries = useMemo(
    () => summarizeByKind(project.id, inventory),
    [project.id, inventory],
  );

  const filtered = useMemo(
    () => filterInventory(inventory, query),
    [inventory, query],
  );

  const recommendations = useMemo(
    () => buildWorkspaceRecommendations(project.id, inventory),
    [project.id, inventory],
  );

  const searching = query.trim().length > 0;

  return (
    <div className="space-y-8">
      <ProjectDashboardHero
        title={project.title}
        schoolYear={project.schoolYear}
        subject={project.subject}
        grade={project.grade}
        percentComplete={progress.percentComplete}
      />

      <WorkspaceSearch
        value={query}
        onChange={setQuery}
        resultCount={filtered.length}
      />

      {searching ? (
        <section aria-labelledby="search-results">
          <h3
            id="search-results"
            className="mb-3 text-lg font-semibold tracking-tight text-slate-900"
          >
            Search results
          </h3>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No resources match “{query.trim()}”.
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    to={item.href}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm no-underline hover:border-slate-300"
                  >
                    <span>
                      <span className="font-semibold text-slate-900">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs capitalize text-slate-500">
                        {item.kind}
                        {item.meta ? ` · ${item.meta}` : ""}
                      </span>
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Open
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          <section aria-labelledby="resource-summary">
            <h3
              id="resource-summary"
              className="mb-3 text-lg font-semibold tracking-tight text-slate-900"
            >
              Resource summary
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {summaries.map((summary, index) => (
                <ResourceSummaryCard
                  key={summary.kind}
                  projectId={project.id}
                  summary={summary}
                  expanded={expanded === summary.kind}
                  onToggle={() =>
                    setExpanded((cur) =>
                      cur === summary.kind ? null : summary.kind,
                    )
                  }
                  index={index}
                />
              ))}
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-2">
            <RecentActivitySection items={inventory} />
            <ProjectTimeline projectId={project.id} inventory={inventory} />
          </div>

          <WorkspaceCopilotPanel recommendations={recommendations} />
        </>
      )}
    </div>
  );
}
