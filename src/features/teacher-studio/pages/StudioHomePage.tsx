import { Link } from "react-router-dom";
import { QUICK_ACTIONS } from "../constants/navigation";
import {
  useStudioHomeData,
  useTeacherStudio,
} from "../context/TeacherStudioContext";

export function StudioHomePage() {
  const { teacher, setActiveProjectId } = useTeacherStudio();
  const { recentProjects, schedule, recommendations, suggestions } =
    useStudioHomeData();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bună dimineața" : hour < 18 ? "Bună ziua" : "Bună seara";

  return (
    <div>
      <header>
        <h1 className="ts-page-title">
          {greeting}, {teacher.displayName}
        </h1>
        <p className="ts-page-lead">
          Teacher Studio este spațiul tău de lucru. Totul începe dintr-un
          proiect — PRIMA te ajută, tu decizi.
        </p>
      </header>

      <section className="ts-section" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="ts-section-title">
          Acțiuni rapide
        </h2>
        <div className="ts-grid-actions">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.id} to={action.href} className="ts-action">
              <span className="ts-action-label">{action.label}</span>
              <span className="ts-action-desc">{action.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ts-section" aria-labelledby="continue-heading">
        <h2 id="continue-heading" className="ts-section-title">
          Continuă lucrul
        </h2>
        {recentProjects.length === 0 ? (
          <p className="ts-page-lead">
            Nu ai proiecte încă.{" "}
            <Link to="/create/experience">Creează prima lecție</Link>.
          </p>
        ) : (
          <div className="ts-list">
            {recentProjects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                to={`/studio/${project.id}`}
                className="ts-row"
                onClick={() => setActiveProjectId(project.id)}
              >
                <div>
                  <div className="ts-row-title">{project.title}</div>
                  <div className="ts-row-meta">
                    {project.subject ?? "Proiect"} · actualizat recent
                  </div>
                </div>
                <span className="ts-chip">Deschide</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="ts-section" aria-labelledby="recent-projects-heading">
        <h2 id="recent-projects-heading" className="ts-section-title">
          Proiecte recente
        </h2>
        <div className="ts-list">
          {recentProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects`}
              className="ts-row"
              onClick={() => setActiveProjectId(project.id)}
            >
              <div>
                <div className="ts-row-title">{project.title}</div>
                <div className="ts-row-meta">
                  {project.favorite ? "Favorit · " : ""}
                  {project.grade || project.subject || "Fără etichetă"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="ts-section" aria-labelledby="suggested-heading">
        <h2 id="suggested-heading" className="ts-section-title">
          Activități sugerate
        </h2>
        <div className="ts-list">
          {suggestions.map((item) => (
            <Link key={item.id} to={item.href} className="ts-row">
              <div>
                <div className="ts-row-title">{item.title}</div>
                <div className="ts-row-meta">{item.detail}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="ts-section" aria-labelledby="schedule-heading">
        <h2 id="schedule-heading" className="ts-section-title">
          Programul de azi
        </h2>
        <div className="ts-list">
          {schedule.map((event) => (
            <div key={event.id} className="ts-row">
              <div>
                <div className="ts-row-title">{event.title}</div>
                <div className="ts-row-meta">
                  {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
                  {event.location ? ` · ${event.location}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ts-section" aria-labelledby="ai-rec-heading">
        <h2 id="ai-rec-heading" className="ts-section-title">
          Recomandări PRIMA
        </h2>
        <div className="ts-list">
          {recommendations.map((rec) => (
            <Link key={rec.id} to={rec.href} className="ts-row">
              <div>
                <div className="ts-row-title">{rec.title}</div>
                <div className="ts-row-meta">{rec.reason}</div>
              </div>
              <span className="ts-chip">{rec.actionLabel}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
