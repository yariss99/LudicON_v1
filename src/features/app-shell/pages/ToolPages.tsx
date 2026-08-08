import { Link } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { useAiCopilot } from "../../ai-copilot";
import { useCopilot } from "../../../modules/copilot";

type Props = {
  title: string;
  description: string;
  /** When set, deep-link into an existing builder for the latest project. */
  builderPath?: (projectId: string) => string;
  fallbackHref?: string;
};

/**
 * Minimal tool entry — no lorem, no fake content.
 * Routes teachers into an existing project-scoped tool when possible.
 */
export function ToolEntryPage({
  title,
  description,
  builderPath,
  fallbackHref = "/projects",
}: Props) {
  const { projects } = useProjects();
  const latest = projects
    .filter((p) => !p.archived)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0];

  const href =
    latest && builderPath ? builderPath(latest.id) : fallbackHref;

  return (
    <div>
      <header>
        <h1 className="shell-page-title">{title}</h1>
        <p className="shell-page-lead">{description}</p>
      </header>
      <div className="shell-actions" style={{ marginTop: "1.5rem" }}>
        <Link className="shell-btn shell-btn-primary" to={href}>
          {latest ? `Open in ${latest.title}` : "Choose a project"}
        </Link>
        <Link className="shell-btn" to="/projects">
          All projects
        </Link>
      </div>
    </div>
  );
}

export function AssistantEntryPage() {
  const { setCommandOpen, context } = useAiCopilot();
  const { openPanel, suggestions } = useCopilot();

  return (
    <div>
      <header>
        <h1 className="shell-page-title">P.R.R.I.M.A. Copilot</h1>
        <p className="shell-page-lead">
          Contextual pedagogical suggestions — not a chatbot. Opens only when
          you ask, and only offers the next useful teaching step.
        </p>
      </header>
      <div className="shell-actions" style={{ marginTop: "1.5rem" }}>
        <button
          type="button"
          className="shell-btn shell-btn-primary"
          onClick={() => openPanel()}
        >
          Open Copilot
          {suggestions.length > 0 ? ` (${suggestions.length})` : ""}
        </button>
        <button
          type="button"
          className="shell-btn"
          onClick={() => setCommandOpen(true)}
        >
          Command palette (Ctrl+K)
        </button>
        <Link className="shell-btn" to="/projects">
          {context.projectName
            ? `Continue in ${context.projectName}`
            : "Choose a project"}
        </Link>
      </div>
    </div>
  );
}

export function LessonBuilderEntryShell() {
  return (
    <ToolEntryPage
      title="Lesson Studio"
      description="Design lessons in a creative studio inside a project."
      builderPath={(id) => `/studio/${id}/lessons`}
    />
  );
}

export function WorksheetBuilderEntryShell() {
  return (
    <ToolEntryPage
      title="Worksheet Studio"
      description="Compose practice worksheets from pedagogical blocks inside a project."
      builderPath={(id) => `/studio/${id}/worksheets`}
    />
  );
}

export function AssessmentBuilderEntryShell() {
  return (
    <ToolEntryPage
      title="Assessment Studio"
      description="Measure competencies and support future learning inside a project."
      builderPath={(id) => `/studio/${id}/assessments`}
    />
  );
}

export function GameBuilderEntryShell() {
  return (
    <ToolEntryPage
      title="Game Studio"
      description="Transform lessons and worksheets into learning games around objectives."
      builderPath={(id) => `/studio/${id}/games`}
    />
  );
}

export function StoryBuilderEntryShell() {
  return (
    <ToolEntryPage
      title="Story Studio"
      description="Create interactive learning narratives from lessons, games, and more."
      builderPath={(id) => `/studio/${id}/stories`}
    />
  );
}

export function PresentationBuilderEntryShell() {
  return (
    <ToolEntryPage
      title="Presentation Studio"
      description="Generate classroom presentations from lessons, worksheets, and more."
      builderPath={(id) => `/studio/${id}/presentations`}
    />
  );
}

export function ResourceCenterEntryShell() {
  return (
    <ToolEntryPage
      title="Resource Studio"
      description="Central library for every educational asset — search, reuse, never lose materials."
      fallbackHref="/resource-studio"
      builderPath={(id) => `/resource-studio?project=${id}`}
    />
  );
}

export function ClassroomStudioEntryShell() {
  return (
    <ToolEntryPage
      title="Classroom Studio"
      description="Operational hub connecting lessons, presentations, worksheets, games, and assessments."
      builderPath={(id) => `/studio/${id}/classroom`}
    />
  );
}

export function AnalyticsPage() {
  return (
    <div>
      <header>
        <h1 className="shell-page-title">Analytics</h1>
        <p className="shell-page-lead">
          Usage insights will appear here when available.
        </p>
      </header>
      <div className="shell-empty" style={{ marginTop: "1.5rem" }}>
        No analytics data yet.
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <header>
        <h1 className="shell-page-title">Settings</h1>
        <p className="shell-page-lead">
          Workspace preferences for P.R.R.I.M.A. ON.
        </p>
      </header>
      <section className="shell-section">
        <div className="shell-row">
          <div>
            <div className="shell-row-title">Work experience</div>
            <div className="shell-row-meta">
              Guided or Advanced — change anytime
            </div>
          </div>
          <Link className="shell-btn" to="/onboarding/experience">
            Change
          </Link>
        </div>
      </section>
      <section className="shell-section">
        <div className="shell-row">
          <div>
            <div className="shell-row-title">Profile</div>
            <div className="shell-row-meta">Display name and locale</div>
          </div>
          <span className="shell-row-meta">Local</span>
        </div>
      </section>
      <section className="shell-section">
        <div className="shell-row">
          <div>
            <div className="shell-row-title">Notifications</div>
            <div className="shell-row-meta">In-app alerts</div>
          </div>
          <Link className="shell-btn" to="/notifications">
            Open
          </Link>
        </div>
      </section>
    </div>
  );
}

export function NotificationsPage() {
  return (
    <div>
      <header>
        <h1 className="shell-page-title">Notifications</h1>
        <p className="shell-page-lead">Updates about your workspace.</p>
      </header>
      <div className="shell-empty" style={{ marginTop: "1.5rem" }}>
        No notifications.
      </div>
    </div>
  );
}
