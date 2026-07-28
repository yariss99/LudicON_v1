import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import {
  createLessonInProject,
  LessonBuilderProvider,
} from "./hooks/useLessonBuilder";
import { lessonBuilderRepository } from "./services/lessonBuilderRepository";
import { LessonBuilderHeader } from "./components/LessonBuilderHeader";
import { LessonSectionNav } from "./components/LessonSectionNav";
import { LessonEditorPane } from "./components/LessonEditorPane";
import { LessonSideRail } from "./components/LessonSideRail";
import "./styles/lesson-builder.css";

function LessonBuilderShell() {
  return (
    <div className="lesson-builder">
      <div className="lb-shell">
        <LessonBuilderHeader />
        <div className="lb-body">
          <LessonSectionNav />
          <main className="lb-main">
            <LessonEditorPane />
          </main>
          <LessonSideRail />
        </div>
      </div>
    </div>
  );
}

function LessonMissing({
  projectId,
  lessonId,
}: {
  projectId: string;
  lessonId: string;
}) {
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  return (
    <div className="lesson-builder">
      <div className="lb-missing">
        <h1 className="lb-section-title">Lecție negăsită</h1>
        <p className="lb-lead">
          Nu există lecția <code>{lessonId}</code> în acest proiect.
        </p>
        <div className="lb-actions" style={{ justifyContent: "center" }}>
          <Link className="lb-btn" to={`/studio/${projectId}/lessons`}>
            Înapoi la lecții
          </Link>
          {project ? (
            <button
              type="button"
              className="lb-btn lb-btn-primary"
              onClick={() => {
                const lesson = createLessonInProject(project);
                navigate(`/lesson-builder/${project.id}/${lesson.id}`);
              }}
            >
              Creează lecție nouă
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Flagship Lesson Builder.
 * Route: `/lesson-builder/:projectId/:lessonId`
 * Lessons always belong to a Project Workspace.
 */
export function LessonBuilderPage() {
  const { projectId = "", lessonId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!projectId || !lessonId || !project) {
      setMissing(true);
      setReady(false);
      return;
    }
    const lesson = lessonBuilderRepository.getById(lessonId);
    if (!lesson || lesson.projectId !== project.id) {
      setMissing(true);
      setReady(false);
      return;
    }
    setMissing(false);
    setReady(true);
  }, [project, projectId, lessonId]);

  if (!projectId) {
    return (
      <div className="lesson-builder">
        <div className="lb-missing">
          <p className="lb-lead">Lesson Builder necesită un proiect.</p>
          <Link className="lb-btn lb-btn-primary" to="/projects">
            Alege un proiect
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="lesson-builder">
        <div className="lb-missing">
          <h1 className="lb-section-title">Proiect negăsit</h1>
          <Link className="lb-btn lb-btn-primary" to="/projects">
            Înapoi
          </Link>
        </div>
      </div>
    );
  }

  if (missing || !lessonId) {
    return <LessonMissing projectId={projectId} lessonId={lessonId || "—"} />;
  }

  if (!ready) return null;

  return (
    <LessonBuilderProvider projectId={project.id} lessonId={lessonId}>
      <LessonBuilderShell />
    </LessonBuilderProvider>
  );
}

/** Create-or-open entry: `/lesson-builder/:projectId` */
export function LessonBuilderEntryPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  useEffect(() => {
    if (!project) return;
    const existing = lessonBuilderRepository.listByProject(project.id)[0];
    if (existing) {
      navigate(`/lesson-builder/${project.id}/${existing.id}`, { replace: true });
      return;
    }
    const created = createLessonInProject(project);
    navigate(`/lesson-builder/${project.id}/${created.id}`, { replace: true });
  }, [project, navigate]);

  if (!project) {
    return (
      <div className="lesson-builder">
        <div className="lb-missing">
          <h1 className="lb-section-title">Proiect negăsit</h1>
          <Link className="lb-btn lb-btn-primary" to="/projects">
            Înapoi la proiecte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-builder">
      <div className="lb-missing">
        <p className="lb-lead">Se deschide Lesson Builder…</p>
      </div>
    </div>
  );
}

export default LessonBuilderPage;
