import type { Project, ProjectState } from "../../../types/project";

const MINUTES_PER_LESSON = 45;

export function progressPercentFromState(state: ProjectState): number {
  switch (state) {
    case "conversation":
      return 28;
    case "blueprint_review":
      return 55;
    case "approved":
      return 78;
    case "resources_ready":
      return 100;
    default:
      return 20;
  }
}

export function formatRelativeEdited(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "Recent";
  const delta = Math.max(0, now - then);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Acum";
  if (minutes < 60) return `Acum ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Acum ${hours} ${hours === 1 ? "oră" : "ore"}`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ieri";
  if (days < 7) return `Acum ${days} zile`;
  return new Date(then).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
  });
}

export function countReadyMaterials(projects: readonly Project[]): number {
  return projects.reduce(
    (total, project) =>
      total +
      project.resources.filter((resource) => resource.status === "ready")
        .length,
    0,
  );
}

export function estimateHoursPrepared(projects: readonly Project[]): number {
  const minutes = projects.length * MINUTES_PER_LESSON;
  return Math.round((minutes / 60) * 10) / 10;
}

export type AtelierImpact = {
  lessonsCreated: number;
  materialsReady: number;
  hoursPrepared: number;
  impactLabel: string;
  impactLine: string;
};

export function buildAtelierImpact(
  projects: readonly Project[],
): AtelierImpact {
  const lessonsCreated = projects.length;
  const materialsReady = countReadyMaterials(projects);
  const hoursPrepared = estimateHoursPrepared(projects);
  const readyLessons = projects.filter(
    (project) => project.state === "resources_ready",
  ).length;

  let impactLabel = "La început";
  let impactLine =
    "Fiecare lecție pe care o proiectezi construiește încredere în clasă.";

  if (readyLessons > 0) {
    impactLabel = "Vizibil";
    impactLine = `${readyLessons} ${
      readyLessons === 1 ? "lecție este" : "lecții sunt"
    } gata de predat — elevii simt pregătirea.`;
  } else if (lessonsCreated > 0) {
    impactLabel = "În creștere";
    impactLine =
      "Lucrul tău continuă: fiecare pas apropiie lecția de clasă.";
  }

  return {
    lessonsCreated,
    materialsReady,
    hoursPrepared,
    impactLabel,
    impactLine,
  };
}
