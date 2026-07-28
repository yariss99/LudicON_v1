import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import {
  AssessmentBuilderProvider,
  createAssessmentInProject,
} from "./hooks/useAssessmentBuilder";
import { assessmentBuilderRepository } from "./services/assessmentBuilderRepository";
import {
  ensureLessonForProject,
} from "./services/assessmentCoreBridge";
import { AssessmentBuilderHeader } from "./components/AssessmentBuilderHeader";
import { AssessmentSectionNav } from "./components/AssessmentSectionNav";
import { AssessmentEditorPane } from "./components/AssessmentEditorPane";
import { AssessmentSideRail } from "./components/AssessmentSideRail";
import "./styles/assessment-builder.css";

function AssessmentBuilderShell() {
  return (
    <div className="assessment-builder">
      <div className="ab-shell">
        <AssessmentBuilderHeader />
        <div className="ab-body">
          <AssessmentSectionNav />
          <main className="ab-main">
            <AssessmentEditorPane />
          </main>
          <AssessmentSideRail />
        </div>
      </div>
    </div>
  );
}

function AssessmentMissing({
  projectId,
  assessmentId,
}: {
  projectId: string;
  assessmentId: string;
}) {
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  return (
    <div className="assessment-builder">
      <div className="ab-missing">
        <h1 className="ab-section-title">Evaluare negăsită</h1>
        <p className="ab-lead">
          Nu există evaluarea <code>{assessmentId}</code> în acest proiect.
        </p>
        <div className="ab-actions" style={{ justifyContent: "center" }}>
          <Link className="ab-btn" to={`/studio/${projectId}/assessments`}>
            Înapoi la evaluări
          </Link>
          {project ? (
            <button
              type="button"
              className="ab-btn ab-btn-primary"
              onClick={() => {
                const lessonId = ensureLessonForProject(project);
                const created = createAssessmentInProject({
                  project,
                  lessonId,
                });
                navigate(`/assessment-builder/${project.id}/${created.id}`);
              }}
            >
              Creează evaluare
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Flagship Assessment Builder.
 * Route: `/assessment-builder/:projectId/:assessmentId`
 * Assessments always belong to a Lesson and a Project.
 */
export function AssessmentBuilderPage() {
  const { projectId = "", assessmentId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!projectId || !assessmentId || !project) {
      setMissing(true);
      setReady(false);
      return;
    }
    const doc = assessmentBuilderRepository.getById(assessmentId);
    if (!doc || doc.projectId !== project.id || !doc.lessonId) {
      setMissing(true);
      setReady(false);
      return;
    }
    setMissing(false);
    setReady(true);
  }, [project, projectId, assessmentId]);

  if (!projectId) {
    return (
      <div className="assessment-builder">
        <div className="ab-missing">
          <p className="ab-lead">Assessment Builder necesită un proiect.</p>
          <Link className="ab-btn ab-btn-primary" to="/projects">
            Alege un proiect
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="assessment-builder">
        <div className="ab-missing">
          <h1 className="ab-section-title">Proiect negăsit</h1>
          <Link className="ab-btn ab-btn-primary" to="/projects">
            Înapoi
          </Link>
        </div>
      </div>
    );
  }

  if (missing || !assessmentId) {
    return (
      <AssessmentMissing
        projectId={projectId}
        assessmentId={assessmentId || "—"}
      />
    );
  }

  if (!ready) return null;

  return (
    <AssessmentBuilderProvider
      projectId={project.id}
      assessmentId={assessmentId}
    >
      <AssessmentBuilderShell />
    </AssessmentBuilderProvider>
  );
}

/** `/assessment-builder/:projectId` — create or open latest */
export function AssessmentBuilderEntryPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  useEffect(() => {
    if (!project) return;
    const existing = assessmentBuilderRepository.listByProject(project.id)[0];
    if (existing) {
      navigate(`/assessment-builder/${project.id}/${existing.id}`, {
        replace: true,
      });
      return;
    }
    const lessonId = ensureLessonForProject(project);
    const created = createAssessmentInProject({ project, lessonId });
    navigate(`/assessment-builder/${project.id}/${created.id}`, {
      replace: true,
    });
  }, [project, navigate]);

  if (!project) {
    return (
      <div className="assessment-builder">
        <div className="ab-missing">
          <h1 className="ab-section-title">Proiect negăsit</h1>
          <Link className="ab-btn ab-btn-primary" to="/projects">
            Înapoi la proiecte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-builder">
      <div className="ab-missing">
        <p className="ab-lead">Se deschide Assessment Builder…</p>
      </div>
    </div>
  );
}

export default AssessmentBuilderPage;
