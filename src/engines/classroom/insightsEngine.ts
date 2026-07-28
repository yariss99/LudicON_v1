import type {
  ClassFeedbackNote,
  ClassInsight,
  ExperienceVersion,
  HistorySuggestion,
} from "../../types/classroom";

/**
 * Derive class-level trends from teacher-recorded patterns only.
 * Never uses student identifiers. Never auto-applies decisions.
 */
export function deriveClassInsights(
  feedback: ClassFeedbackNote[],
): ClassInsight[] {
  const buckets = new Map<string, ClassFeedbackNote[]>();

  for (const note of feedback) {
    const key = note.pattern.trim().toLowerCase();
    const list = buckets.get(key) ?? [];
    list.push(note);
    buckets.set(key, list);
  }

  const insights: ClassInsight[] = [...buckets.entries()]
    .map(([key, notes], index) => {
      const sample = notes[0];
      const positive = notes.filter((n) => n.sentiment === "positive").length;
      const tone =
        positive >= notes.length / 2
          ? "Your history highlights this as a strength."
          : "Your notes suggest this is worth watching next time.";

      return {
        id: `insight_${index}_${key.slice(0, 24)}`,
        title: sample.pattern,
        detail: `${tone} Seen across ${notes.length} reflection${notes.length === 1 ? "" : "s"}${
          sample.method ? ` · often with “${sample.method}”` : ""
        }.`,
        evidenceCount: notes.length,
        method: sample.method,
        topic: sample.topic,
        schoolYear: sample.schoolYear,
      };
    })
    .sort((a, b) => b.evidenceCount - a.evidenceCount);

  return insights.slice(0, 8);
}

export function deriveHistorySuggestions(
  feedback: ClassFeedbackNote[],
  versions: ExperienceVersion[],
): HistorySuggestion[] {
  const suggestions: HistorySuggestion[] = [];
  const positiveMethods = feedback.filter(
    (n) => n.sentiment === "positive" && n.method,
  );

  const methodCounts = new Map<string, number>();
  for (const note of positiveMethods) {
    const method = note.method!;
    methodCounts.set(method, (methodCounts.get(method) ?? 0) + 1);
  }

  const topMethods = [...methodCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  for (const [method, count] of topMethods) {
    const sample = positiveMethods.find((n) => n.method === method);
    suggestions.push({
      id: `sug_method_${method}`,
      title: `Lean on ${method} again`,
      detail: `In your notes, “${method}” showed up positively ${count} time${count === 1 ? "" : "s"}. You might weave it into your next experience — only if it fits.`,
      basedOn: sample?.pattern ?? "Your teaching history",
      projectId: sample?.projectId,
    });
  }

  const needsWork = feedback.filter((n) => n.sentiment === "needs_work");
  for (const note of needsWork.slice(0, 2)) {
    suggestions.push({
      id: `sug_watch_${note.id}`,
      title: "A gentle redesign from your notes",
      detail: `${note.pattern} Next time you teach “${note.topic ?? "this topic"}”, you could shorten or balance that part — your choice.`,
      basedOn: `Reflection · ${note.schoolYear}`,
      projectId: note.projectId,
    });
  }

  // Evolution cue — if an experience matured across versions
  const byProject = new Map<string, ExperienceVersion[]>();
  for (const version of versions) {
    const list = byProject.get(version.projectId) ?? [];
    list.push(version);
    byProject.set(version.projectId, list);
  }

  for (const [projectId, list] of byProject) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => a.version - b.version);
    const first = sorted[0];
    const latest = sorted[sorted.length - 1];
    if (latest.methods.length > first.methods.length) {
      suggestions.push({
        id: `sug_evo_${projectId}`,
        title: `“${latest.title}” grew richer over time`,
        detail: `From ${first.label} to ${latest.label}, you added methods like ${latest.methods
          .filter((m) => !first.methods.includes(m))
          .slice(0, 2)
          .join(" and ")}. That evolution is yours to reuse.`,
        basedOn: "Experience evolution",
        projectId,
      });
      break;
    }
  }

  return suggestions.slice(0, 6);
}
