import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import {
  StoryBuilderProvider,
  createStoryInProject,
} from "./hooks/useStoryBuilder";
import { storyBuilderRepository } from "./services/storyBuilderRepository";
import { ensureLessonForProject } from "./services/storyCoreBridge";
import { StoryBuilderHeader } from "./components/StoryBuilderHeader";
import { StorySectionNav } from "./components/StorySectionNav";
import { StoryEditorPane } from "./components/StoryEditorPane";
import { StorySideRail } from "./components/StorySideRail";
import "./styles/story-builder.css";

function StoryBuilderShell() {
  return (
    <div className="story-builder">
      <div className="sb-shell">
        <StoryBuilderHeader />
        <div className="sb-body">
          <StorySectionNav />
          <main className="sb-main">
            <StoryEditorPane />
          </main>
          <StorySideRail />
        </div>
      </div>
    </div>
  );
}

function StoryMissing({
  projectId,
  storyId,
}: {
  projectId: string;
  storyId: string;
}) {
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  return (
    <div className="story-builder">
      <div className="sb-missing">
        <h1 className="sb-section-title">Poveste negăsită</h1>
        <p className="sb-lead">
          Nu există povestea <code>{storyId}</code> în acest proiect.
        </p>
        <div className="sb-actions" style={{ justifyContent: "center" }}>
          <Link className="sb-btn" to={`/studio/${projectId}/stories`}>
            Înapoi la povești
          </Link>
          {project ? (
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={() => {
                const lessonId = ensureLessonForProject(project);
                const created = createStoryInProject({ project, lessonId });
                navigate(`/story-builder/${project.id}/${created.id}`);
              }}
            >
              Creează poveste
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Route: `/story-builder/:projectId/:storyId` */
export function StoryBuilderPage() {
  const { projectId = "", storyId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!projectId || !storyId || !project) {
      setMissing(true);
      setReady(false);
      return;
    }
    const doc = storyBuilderRepository.getById(storyId);
    if (!doc || doc.projectId !== project.id || !doc.lessonId) {
      setMissing(true);
      setReady(false);
      return;
    }
    setMissing(false);
    setReady(true);
  }, [project, projectId, storyId]);

  if (!projectId) {
    return (
      <div className="story-builder">
        <div className="sb-missing">
          <p className="sb-lead">Story Builder necesită un proiect.</p>
          <Link className="sb-btn sb-btn-primary" to="/projects">
            Alege un proiect
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="story-builder">
        <div className="sb-missing">
          <h1 className="sb-section-title">Proiect negăsit</h1>
          <Link className="sb-btn sb-btn-primary" to="/projects">
            Înapoi
          </Link>
        </div>
      </div>
    );
  }

  if (missing || !storyId) {
    return <StoryMissing projectId={projectId} storyId={storyId || "—"} />;
  }

  if (!ready) return null;

  return (
    <StoryBuilderProvider projectId={project.id} storyId={storyId}>
      <StoryBuilderShell />
    </StoryBuilderProvider>
  );
}

/** `/story-builder/:projectId` */
export function StoryBuilderEntryPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  useEffect(() => {
    if (!project) return;
    const existing = storyBuilderRepository.listByProject(project.id)[0];
    if (existing) {
      navigate(`/story-builder/${project.id}/${existing.id}`, { replace: true });
      return;
    }
    const lessonId = ensureLessonForProject(project);
    const created = createStoryInProject({ project, lessonId });
    navigate(`/story-builder/${project.id}/${created.id}`, { replace: true });
  }, [project, navigate]);

  if (!project) {
    return (
      <div className="story-builder">
        <div className="sb-missing">
          <h1 className="sb-section-title">Proiect negăsit</h1>
          <Link className="sb-btn sb-btn-primary" to="/projects">
            Înapoi la proiecte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="story-builder">
      <div className="sb-missing">
        <p className="sb-lead">Se deschide Story Builder…</p>
      </div>
    </div>
  );
}

export default StoryBuilderPage;
