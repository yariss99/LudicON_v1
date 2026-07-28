import { Link } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { buildTodaySchedule } from "../data/studioDerivations";

export function StudioCalendarPage() {
  const { projects } = useProjects();
  const events = buildTodaySchedule(projects.filter((p) => !p.archived));
  const todayLabel = new Date().toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <header>
        <h1 className="ts-page-title">Calendar</h1>
        <p className="ts-page-lead">
          Programul zilei, legat de proiectele tale de predare.
        </p>
      </header>

      <p className="ts-section ts-chip" style={{ width: "fit-content" }}>
        {todayLabel}
      </p>

      <div className="ts-section ts-list">
        {events.map((event) => (
          <div key={event.id} className="ts-row">
            <div>
              <div className="ts-row-title">{event.title}</div>
              <div className="ts-row-meta">
                {formatTime(event.startsAt)} – {formatTime(event.endsAt)}
                {event.location ? ` · ${event.location}` : ""}
              </div>
            </div>
            {event.projectId ? (
              <Link className="ts-icon-btn" to={`/studio/${event.projectId}`}>
                Proiect
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ro-RO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
