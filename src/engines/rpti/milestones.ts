import type { AchievementMilestone, ReflectionRecord } from "./types";

const CATALOG: Omit<AchievementMilestone, "achievedAt" | "celebrated">[] = [
  {
    id: "first_lesson_reflected",
    titleRo: "Prima reflecție",
    descriptionRo: "Ai documentat prima lecție — începutul creșterii profesionale.",
  },
  {
    id: "reflections_5",
    titleRo: "5 reflecții",
    descriptionRo: "Obiceiul se formează. Continui să înveți din practică.",
  },
  {
    id: "reflections_20",
    titleRo: "20 de reflecții",
    descriptionRo: "Practică reflexivă consistentă — fără clasamente, doar progres.",
  },
  {
    id: "differentiation_habit",
    titleRo: "Diferențiere în practică",
    descriptionRo: "Ai reflectat de mai multe ori asupra traseelor de sprijin/extensie.",
  },
  {
    id: "strategy_experiment",
    titleRo: "Strategie nouă încercată",
    descriptionRo: "Ai experimentat și ai notat ce a funcționat.",
  },
];

export function evaluateMilestones(
  reflections: ReflectionRecord[],
  previous: AchievementMilestone[] = [],
): AchievementMilestone[] {
  const completed = reflections.filter((r) => r.status === "completed");
  const now = new Date().toISOString();
  const prevMap = new Map(previous.map((m) => [m.id, m]));

  const diffCount = completed.filter((r) =>
    r.answers.some(
      (a) =>
        a.promptId === "differentiation" && a.value.trim().length > 0,
    ),
  ).length;

  const checks: Record<string, boolean> = {
    first_lesson_reflected: completed.length >= 1,
    reflections_5: completed.length >= 5,
    reflections_20: completed.length >= 20,
    differentiation_habit: diffCount >= 3,
    strategy_experiment: completed.some((r) =>
      /strategie|nou|încerc/i.test(
        [...r.answers.map((a) => a.value), ...r.strengths].join(" "),
      ),
    ),
  };

  return CATALOG.map((item) => {
    const prior = prevMap.get(item.id);
    const achieved = checks[item.id] ?? false;
    if (!achieved) {
      return {
        ...item,
        achievedAt: undefined,
        celebrated: false,
      };
    }
    return {
      ...item,
      achievedAt: prior?.achievedAt ?? now,
      celebrated: prior?.celebrated ?? false,
    };
  });
}

export function celebrateMilestone(
  milestones: AchievementMilestone[],
  id: string,
): AchievementMilestone[] {
  return milestones.map((m) =>
    m.id === id && m.achievedAt ? { ...m, celebrated: true } : m,
  );
}
