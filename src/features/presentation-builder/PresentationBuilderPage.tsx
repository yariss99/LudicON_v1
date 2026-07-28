import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import {
  PresentationBuilderProvider,
  createPresentationInProject,
  usePresentationBuilder,
} from "./hooks/usePresentationBuilder";
import { presentationBuilderRepository } from "./services/presentationBuilderRepository";
import { ensureLessonForProject } from "./services/presentationCoreBridge";
import { PresentationBuilderHeader } from "./components/PresentationBuilderHeader";
import { PresentationSectionNav } from "./components/PresentationSectionNav";
import { PresentationEditorPane } from "./components/PresentationEditorPane";
import { PresentationSideRail } from "./components/PresentationSideRail";
import { PresenterMode } from "./components/PresenterMode";
import "./styles/presentation-builder.css";

function PresentationBuilderShell() {
  const { panel, setPanel, setSectionId } = usePresentationBuilder();

  return (
    <div className="presentation-builder">
      <div className="pb-shell">
        <PresentationBuilderHeader />
        <div className="pb-body">
          <PresentationSectionNav />
          <main className="pb-main">
            <PresentationEditorPane />
          </main>
          <PresentationSideRail />
        </div>
      </div>
      {panel === "presenter" ? (
        <PresenterMode
          onClose={() => {
            setPanel("editor");
            setSectionId("slides");
          }}
        />
      ) : null}
    </div>
  );
}

function PresentationMissing({
  projectId,
  presentationId,
}: {
  projectId: string;
  presentationId: string;
}) {
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  return (
    <div className="presentation-builder">
      <div className="pb-missing">
        <h1 className="pb-section-title">Prezentare negăsită</h1>
        <p className="pb-lead">
          Nu există prezentarea <code>{presentationId}</code> în acest proiect.
        </p>
        <div className="pb-actions" style={{ justifyContent: "center" }}>
          <Link className="pb-btn" to={`/studio/${projectId}/presentations`}>
            Înapoi la prezentări
          </Link>
          {project ? (
            <button
              type="button"
              className="pb-btn pb-btn-primary"
              onClick={() => {
                const lessonId = ensureLessonForProject(project);
                const created = createPresentationInProject({
                  project,
                  lessonId,
                });
                navigate(
                  `/presentation-builder/${project.id}/${created.id}`,
                );
              }}
            >
              Creează prezentare
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Route: `/presentation-builder/:projectId/:presentationId` */
export function PresentationBuilderPage() {
  const { projectId = "", presentationId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!projectId || !presentationId || !project) {
      setMissing(true);
      setReady(false);
      return;
    }
    const doc = presentationBuilderRepository.getById(presentationId);
    if (!doc || doc.projectId !== project.id) {
      setMissing(true);
      setReady(false);
      return;
    }
    setMissing(false);
    setReady(true);
  }, [project, projectId, presentationId]);

  if (!projectId) {
    return (
      <div className="presentation-builder">
        <div className="pb-missing">
          <p className="pb-lead">Presentation Builder necesită un proiect.</p>
          <Link className="pb-btn pb-btn-primary" to="/projects">
            Alege un proiect
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="presentation-builder">
        <div className="pb-missing">
          <h1 className="pb-section-title">Proiect negăsit</h1>
          <Link className="pb-btn pb-btn-primary" to="/projects">
            Înapoi
          </Link>
        </div>
      </div>
    );
  }

  if (missing || !presentationId) {
    return (
      <PresentationMissing
        projectId={projectId}
        presentationId={presentationId || "—"}
      />
    );
  }

  if (!ready) return null;

  return (
    <PresentationBuilderProvider
      projectId={project.id}
      presentationId={presentationId}
    >
      <PresentationBuilderShell />
    </PresentationBuilderProvider>
  );
}

/** `/presentation-builder/:projectId` */
export function PresentationBuilderEntryPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  useEffect(() => {
    if (!project) return;
    const existing =
      presentationBuilderRepository.listByProject(project.id)[0];
    if (existing) {
      navigate(`/presentation-builder/${project.id}/${existing.id}`, {
        replace: true,
      });
      return;
    }
    const lessonId = ensureLessonForProject(project);
    const created = createPresentationInProject({ project, lessonId });
    navigate(`/presentation-builder/${project.id}/${created.id}`, {
      replace: true,
    });
  }, [project, navigate]);

  if (!project) {
    return (
      <div className="presentation-builder">
        <div className="pb-missing">
          <h1 className="pb-section-title">Proiect negăsit</h1>
          <Link className="pb-btn pb-btn-primary" to="/projects">
            Înapoi la proiecte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="presentation-builder">
      <div className="pb-missing">
        <p className="pb-lead">Se deschide Presentation Builder…</p>
      </div>
    </div>
  );
}

export default PresentationBuilderPage;
