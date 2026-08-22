import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  Gamepad2,
  NotebookPen,
  Presentation,
  ScrollText,
  Sparkles,
} from "lucide-react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { useTeacherAssistant } from "../../teacher-assistant/hooks/useTeacherAssistant";
import { formatRelativeTime } from "../../../utils/date";
import { ProjectCard } from "../components/ProjectCard";
import { StudioHeroArt } from "../components/StudioHeroArt";
import {
  COPILOT_ACTIONS,
  COPILOT_PROMPTS,
  CREATE_OPTIONS,
  QUICK_CREATE_PATH,
} from "../constants/navigation";
import {
  useStudioActivityData,
  useStudioHomeData,
  useTeacherStudio,
} from "../context/TeacherStudioContext";
import type { ActivityKind, CreateOption, CreateOptionId } from "../types";

const CREATE_ICONS: Record<CreateOptionId, typeof NotebookPen> = {
  lesson: NotebookPen,
  worksheet: FileText,
  game: Gamepad2,
  story: ScrollText,
  assessment: ClipboardCheck,
  presentation: Presentation,
};

const ACTIVITY_LABELS: Record<ActivityKind, string> = {
  opened: "Deschis recent",
  edited: "Editat",
  ai_generated: "Generat de PRIMA",
  teacher_modified: "Modificat de tine",
  published: "Publicat",
};

export function StudioHomePage() {
  const { teacher, setActiveProjectId, setAssistantOpen } = useTeacherStudio();
  const { recentProjects } = useStudioHomeData();
  const { items: activity } = useStudioActivityData();
  const { projects } = useProjects();
  const { sendMessage } = useTeacherAssistant();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bună dimineața" : hour < 18 ? "Bună ziua" : "Bună seara";

  const dashboardProjects = recentProjects.slice(0, 4);
  const featuredProject = dashboardProjects[0] ?? null;

  function askCopilot(prompt: string) {
    sendMessage(prompt);
    setAssistantOpen(true);
  }

  return (
    <div>
      <section className="ts-hero">
        <div className="ts-hero-main">
          <p className="ts-hero-kicker">Atelierul tău creativ</p>
          <h1 className="ts-hero-title">{greeting}. Ce construim astăzi?</h1>
          <p className="ts-hero-support">
            Pornește de la ideea ta și transform-o într-o experiență de
            învățare.
          </p>
          <p className="ts-hero-note">
            <Sparkles size={13} aria-hidden />
            Tu conduci procesul. LudicON Copilot te sprijină când ai nevoie.
          </p>

          <div className="ts-hero-actions">
            <Link to={QUICK_CREATE_PATH} className="ts-hero-cta">
              Începe cu ideea ta
              <ArrowRight size={16} aria-hidden />
            </Link>
            {featuredProject ? (
              <Link
                to={`/studio/${featuredProject.id}`}
                className="ts-hero-continue"
                onClick={() => setActiveProjectId(featuredProject.id)}
              >
                Continuă „{featuredProject.title}”
                <ArrowRight size={14} aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="ts-hero-aside">
          <StudioHeroArt />
          <p className="ts-hero-meta">
            {teacher.displayName} · {projects.length}{" "}
            {projects.length === 1 ? "proiect" : "proiecte"}
          </p>
        </div>
      </section>

      <section className="ts-block" aria-labelledby="create-heading">
        <div className="ts-block-head">
          <div>
            <h2 id="create-heading" className="ts-block-title">
              Ce vrei să creezi?
            </h2>
            <p className="ts-block-lead">
              Tu alegi direcția. AI-ul te sprijină pe parcurs.
            </p>
          </div>
        </div>

        <div className="ts-create-grid">
          {CREATE_OPTIONS.map((option) => (
            <CreateCard key={option.id} option={option} />
          ))}
        </div>
      </section>

      <section className="ts-block" aria-labelledby="projects-heading">
        <div className="ts-block-head">
          <div>
            <h2 id="projects-heading" className="ts-block-title">
              Continuă lucrul
            </h2>
            <p className="ts-block-lead">
              Proiectele tale, cu cel mai recent în față.
            </p>
          </div>
          <Link to="/projects" className="ts-block-link">
            Vezi toate proiectele
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        {dashboardProjects.length === 0 ? (
          <div className="ts-desk-empty">
            <h3 className="ts-desk-empty-title">
              Primul tău proiect începe aici.
            </h3>
            <p className="ts-desk-empty-text">
              Alege una dintre opțiunile de mai sus și începe să creezi.
            </p>
            <Link to="/create/experience" className="ts-icon-btn">
              <Sparkles size={15} aria-hidden />
              Creează ceva nou
            </Link>
          </div>
        ) : (
          <div className="ts-project-grid">
            {dashboardProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                featured={index === 0}
                onOpen={() => setActiveProjectId(project.id)}
              />
            ))}
          </div>
        )}
      </section>

      {activity.length > 0 ? (
        <section className="ts-block" aria-labelledby="activity-heading">
          <div className="ts-block-head">
            <div>
              <h2 id="activity-heading" className="ts-block-title">
                Activitate recentă
              </h2>
              <p className="ts-block-lead">Ce s-a schimbat în ultima vreme.</p>
            </div>
            <Link to="/activity" className="ts-block-link">
              Vezi toată activitatea
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>

          <ul className="ts-mini-list">
            {activity.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Link
                  to={item.projectId ? `/studio/${item.projectId}` : "/projects"}
                  className="ts-mini-row"
                >
                  <span className="ts-mini-main">
                    <span className="ts-mini-title">{item.title}</span>
                    <span className="ts-mini-meta">
                      {ACTIVITY_LABELS[item.kind]}
                    </span>
                  </span>
                  <time className="ts-mini-time" dateTime={item.timestamp}>
                    {formatRelativeTime(item.timestamp)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="ts-block" aria-labelledby="copilot-heading">
        <div className="ts-copilot">
          <div className="ts-copilot-head">
            <span className="ts-copilot-mark" aria-hidden>
              <Sparkles size={18} />
            </span>
            <div>
              <h2 id="copilot-heading" className="ts-block-title">
                Lucrăm împreună
              </h2>
              <p className="ts-block-lead">
                Ai o idee? Începe cu ea, iar LudicON te poate ajuta să o
                dezvolți. Tu revizuiești și decizi forma finală.
              </p>
            </div>
          </div>

          <p className="ts-copilot-kicker">Tu alegi de unde pornim</p>
          <div className="ts-copilot-actions">
            {COPILOT_ACTIONS.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="ts-copilot-action"
              >
                {action.label}
                <ArrowRight size={13} aria-hidden />
              </Link>
            ))}
          </div>

          <p className="ts-copilot-kicker">Sau întreabă PRIMA</p>
          <div className="ts-copilot-prompts">
            {COPILOT_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="ts-copilot-chip"
                onClick={() => askCopilot(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CreateCard({ option }: { option: CreateOption }) {
  const Icon = CREATE_ICONS[option.id];
  // Every supported type now starts in Quick Create, which creates the project.
  const href = option.builderPath
    ? `${QUICK_CREATE_PATH}?type=${option.id}`
    : null;

  const body = (
    <>
      <span className="ts-create-icon" aria-hidden>
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <span className="ts-create-label">
        {option.label}
        {!href ? <span className="ts-create-badge">În curând</span> : null}
      </span>
      <span className="ts-create-desc">{option.description}</span>
      <span className="ts-create-meta">
        {href ? "Creezi un proiect nou" : "Încă nu are un atelier dedicat"}
      </span>
    </>
  );

  const accent = {
    "--ts-c": `var(${option.accentToken})`,
  } as CSSProperties;

  if (!href) {
    return (
      <div className="ts-create-card is-soon" style={accent}>
        {body}
      </div>
    );
  }

  return (
    <Link to={href} className="ts-create-card" style={accent}>
      {body}
    </Link>
  );
}

