import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, FolderX } from "lucide-react";
import { ProjectId } from "@ludicon/domain";
import {
  Button,
  EmptyState,
  LoadingBlock,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ludicon/ui";

import { WORKSPACE_COPY } from "../../features/workspace/copy";
import { MaterialsTab } from "../../features/workspace/MaterialsTab";
import { OverviewTab } from "../../features/workspace/OverviewTab";
import { ActivityTab, VersionsTab } from "../../features/workspace/HistoryTabs";
import { SettingsTab } from "../../features/workspace/SettingsTab";
import {
  useWorkspace,
  useWorkspaceActions,
} from "../../features/workspace/useWorkspace";
import type { BuilderKind } from "../../features/builder/types";
import { TeacherAssistant } from "../../features/assistant/TeacherAssistant";

const params = z.object({ projectId: ProjectId });

export const Route = createFileRoute("/_studio/projects_/$projectId")({
  params: { parse: params.parse },
  component: ProjectWorkspace,
});

/**
 * The project workspace — the hub that launches the builder.
 *
 * Twelve tabs became five. Six of the old ones were one-per-asset-kind lists
 * over six different repositories; they are one `Materiale` tab now. Two were
 * embeds of other features, and one was a suggestions panel that belongs in the
 * builder's own rail, next to the work it comments on.
 */
function ProjectWorkspace() {
  const { projectId } = Route.useParams();
  const state = useWorkspace(projectId);
  const navigate = useNavigate();
  const actions = useWorkspaceActions(
    state.status === "ready" ? state.data.project : null,
  );

  if (state.status === "loading") {
    return (
      <div className="shell-column px-6 py-16">
        <LoadingBlock label={WORKSPACE_COPY.loading} />
      </div>
    );
  }

  if (state.status !== "ready") {
    return (
      <div className="shell-column px-6 py-16">
        <EmptyState
          icon={<FolderX aria-hidden strokeWidth={1.75} />}
          title={
            state.status === "missing"
              ? WORKSPACE_COPY.missingTitle
              : WORKSPACE_COPY.failedTitle
          }
          explanation={
            state.status === "missing"
              ? WORKSPACE_COPY.missingExplanation
              : WORKSPACE_COPY.failedExplanation
          }
          action={
            <Button variant="primary" asChild>
              <Link to="/projects">{WORKSPACE_COPY.back}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { project, documents, versions } = state.data;

  const addMaterial = (kind: BuilderKind) => {
    void actions.addMaterial(kind).then((documentId) => {
      if (documentId === null) return;
      void navigate({
        to: "/builder/$projectId/$kind/$documentId",
        params: { projectId, kind, documentId },
      });
    });
  };

  return (
    <div className="shell-column px-6 py-10">
      <Button variant="ghost" size="sm" asChild className="-ml-4 mb-4">
        <Link to="/projects">
          <ArrowLeft aria-hidden size={18} strokeWidth={1.75} />
          {WORKSPACE_COPY.back}
        </Link>
      </Button>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            {project.title}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {project.subject} · {project.grade}
          </p>
        </div>
        <StatusBadge
          status={project.state === "published" ? "published" : "draft"}
        />
      </header>

      <Tabs defaultValue="overview">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">
            {WORKSPACE_COPY.tabs.overview}
          </TabsTrigger>
          <TabsTrigger value="materials">
            {WORKSPACE_COPY.tabs.materials}
          </TabsTrigger>
          <TabsTrigger value="versions">
            {WORKSPACE_COPY.tabs.versions}
          </TabsTrigger>
          <TabsTrigger value="activity">
            {WORKSPACE_COPY.tabs.activity}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {WORKSPACE_COPY.tabs.settings}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab
            project={project}
            documents={documents}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="materials">
          <MaterialsTab
            projectId={projectId}
            documents={documents}
            onAdd={addMaterial}
          />
        </TabsContent>

        <TabsContent value="versions">
          <VersionsTab versions={versions} projectId={projectId} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTab versions={versions} projectId={projectId} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab
            project={project}
            onSave={(patch) => void actions.saveSettings(patch)}
          />
        </TabsContent>
      </Tabs>

      <TeacherAssistant projectId={projectId} />
    </div>
  );
}
