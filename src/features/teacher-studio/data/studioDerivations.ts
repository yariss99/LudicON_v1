import type { Project } from "../../../types/project";
import type {
  ActivityItem,
  AiRecommendation,
  CalendarEvent,
  LibraryResource,
  StudioNotification,
  SuggestedActivity,
  StudioTeacherProfile,
} from "../types";

export const STUDIO_TEACHER: StudioTeacherProfile = {
  teacherId: "teacher-local",
  displayName: "Profesor",
  locale: "ro-RO",
  schoolName: "Școala mea",
};

export function buildLibraryFromProjects(
  projects: readonly Project[],
): LibraryResource[] {
  return projects
    .filter((p) => !p.archived)
    .slice(0, 24)
    .map((p, index) => ({
      id: `lib-${p.id}`,
      title: p.title,
      kind: index % 3 === 0 ? "worksheet" : "lesson",
      projectId: p.id,
      projectTitle: p.title,
      scope:
        p.favorite
          ? "favorites"
          : index % 5 === 0
            ? "templates"
            : index % 4 === 0
              ? "generated"
              : "all",
      updatedAt: p.updatedAt,
      favorite: Boolean(p.favorite),
    }));
}

export function buildActivityFromProjects(
  projects: readonly Project[],
): ActivityItem[] {
  const kinds = [
    "opened",
    "edited",
    "ai_generated",
    "teacher_modified",
    "published",
  ] as const;
  return projects.slice(0, 12).map((p, i) => ({
    id: `act-${p.id}`,
    kind: kinds[i % kinds.length]!,
    title: p.title,
    detail:
      kinds[i % kinds.length] === "ai_generated"
        ? "PRIMA a propus o variantă. Tu decizi."
        : kinds[i % kinds.length] === "published"
          ? "Publicat pentru clasă"
          : "Actualizat în proiect",
    projectId: p.id,
    timestamp: p.updatedAt,
    timestampLabel: relativeLabel(p.updatedAt, i),
  }));
}

function relativeLabel(_iso: string, index: number): string {
  if (index === 0) return "Astăzi";
  if (index === 1) return "Ieri";
  return `Acum ${index + 1} zile`;
}

export function buildTodaySchedule(
  projects: readonly Project[],
): CalendarEvent[] {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const base = `${y}-${m}-${d}`;
  const first = projects[0];
  return [
    {
      id: "cal-1",
      title: first ? `Predare · ${first.title}` : "Pregătire oră",
      startsAt: `${base}T08:00:00`,
      endsAt: `${base}T08:50:00`,
      projectId: first?.id,
      location: "Sala clasei",
    },
    {
      id: "cal-2",
      title: "Planificare săptămânală",
      startsAt: `${base}T14:00:00`,
      endsAt: `${base}T14:30:00`,
    },
  ];
}

export function buildNotifications(
  projects: readonly Project[],
): StudioNotification[] {
  const p = projects[0];
  return [
    {
      id: "n-1",
      title: "Sugestie PRIMA",
      body: p
        ? `Poți îmbunătăți evaluarea din „${p.title}”.`
        : "Începe un proiect pentru sugestii personalizate.",
      createdAt: new Date().toISOString(),
      read: false,
      href: p ? `/studio/${p.id}` : "/create/experience",
    },
    {
      id: "n-2",
      title: "Salvare automată",
      body: "Modificările tale sunt păstrate local în siguranță.",
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
      read: true,
    },
  ];
}

export function buildRecommendations(
  projects: readonly Project[],
): AiRecommendation[] {
  const focus = projects.find((p) => !p.archived) ?? projects[0];
  if (!focus) {
    return [
      {
        id: "rec-start",
        title: "Pornește prima lecție",
        reason: "PRIMA te ghidează pas cu pas — tu rămâi autorul.",
        actionLabel: "Creează lecție",
        href: "/create/experience?intent=lesson",
      },
    ];
  }
  return [
    {
      id: "rec-continue",
      title: `Continuă „${focus.title}”`,
      reason: "Ai lăsat proiectul aproape de o etapă utilă pentru clasă.",
      actionLabel: "Deschide",
      href: `/studio/${focus.id}`,
    },
    {
      id: "rec-worksheet",
      title: "Adaugă o fișă scurtă",
      reason: "O fișă de 10 minute întărește obiectivele fără efort mare.",
      actionLabel: "Creează fișă",
      href: `/create/experience?intent=worksheet`,
    },
  ];
}

export function buildSuggestions(
  projects: readonly Project[],
): SuggestedActivity[] {
  return [
    {
      id: "sug-1",
      title: "Revizuiește obiectivele",
      detail: "Aliniază O1–O3 înainte de oră.",
      href: projects[0] ? `/studio/${projects[0].id}` : "/projects",
    },
    {
      id: "sug-2",
      title: "Pregătește o verificare formativă",
      detail: "2–3 itemi scurți pentru feedback imediat.",
      href: "/create/experience?intent=assessment",
    },
  ];
}
