import type {
  ClassFeedbackNote,
  ExperienceVersion,
} from "../../types/classroom";
import type {
  DnaAdaptedSuggestion,
  DnaDimensionId,
  DnaDimensionView,
  DnaPattern,
  DnaPresence,
  DnaYearSnapshot,
  PedagogicalDnaProfile,
} from "../../types/pedagogicalDna";
import type { ProjectResourceType } from "../../types/project";

const DIMENSION_META: Record<
  DnaDimensionId,
  { title: string; subtitle: string }
> = {
  methods: {
    title: "Teaching methods",
    subtitle: "How you invite students into learning",
  },
  structure: {
    title: "Lesson structure",
    subtitle: "The shape your experiences tend to take",
  },
  assessment: {
    title: "Assessment preferences",
    subtitle: "How you check understanding with care",
  },
  digital_tools: {
    title: "Digital tools",
    subtitle: "Screens and media you reach for",
  },
  activities: {
    title: "Learning activities",
    subtitle: "What students do in your rooms",
  },
  timing: {
    title: "Timing",
    subtitle: "How you pace a learning hour",
  },
};

type Counter = Map<string, { count: number; years: Set<string>; positive: number }>;

function bump(
  map: Counter,
  key: string,
  year: string,
  positive = false,
): void {
  const entry = map.get(key) ?? {
    count: 0,
    years: new Set<string>(),
    positive: 0,
  };
  entry.count += 1;
  entry.years.add(year);
  if (positive) entry.positive += 1;
  map.set(key, entry);
}

function presenceFor(count: number, max: number): DnaPresence {
  if (count >= Math.max(3, max * 0.55)) return "signature";
  if (count >= 2) return "familiar";
  return "emerging";
}

function presenceLabel(presence: DnaPresence): string {
  if (presence === "signature") return "A signature in your practice";
  if (presence === "familiar") return "Familiar in your designs";
  return "Beginning to show in your work";
}

function topKeys(map: Counter, limit = 4): string[] {
  return [...map.entries()]
    .sort((a, b) => b[1].count - a[1].count || b[1].positive - a[1].positive)
    .slice(0, limit)
    .map(([key]) => key);
}

function resourceSignal(type: ProjectResourceType): {
  dimension: DnaDimensionId;
  key: string;
} | null {
  switch (type) {
    case "activities":
      return { dimension: "activities", key: "collaborative activities" };
    case "game":
      return { dimension: "digital_tools", key: "learning games" };
    case "worksheet":
      return { dimension: "activities", key: "guided practice sheets" };
    case "assessment":
      return { dimension: "assessment", key: "formative checks" };
    case "presentation":
      return { dimension: "digital_tools", key: "visual presentations" };
    case "reflection":
      return { dimension: "structure", key: "closing reflection" };
    case "lesson":
      return { dimension: "structure", key: "clear lesson spine" };
    default:
      return null;
  }
}

function methodDimension(method: string): DnaDimensionId {
  const m = method.toLowerCase();
  if (/assess|exit|formative|quiz|test/.test(m)) return "assessment";
  if (/game|digital|presentation|screen/.test(m)) return "digital_tools";
  if (/outdoor|hands|collabor|inquiry|worksheet|lecture/.test(m)) {
    return /outdoor|hands|collabor|inquiry|worksheet/.test(m)
      ? "activities"
      : "methods";
  }
  if (/outdoor|inquiry|hands/.test(m)) return "activities";
  return "methods";
}

function narrativeFor(label: string, presence: DnaPresence): string {
  const base = presenceLabel(presence);
  const map: Record<string, string> = {
    collaborative: "You often design moments where students think together.",
    "collaborative activities":
      "Pair and group work show up naturally in your planning.",
    game: "Playful challenge is part of how you teach hard ideas.",
    "learning games": "Games help you keep energy and rigor in the same room.",
    worksheet: "Practice sheets support consolidation in your flow.",
    "guided practice sheets":
      "You give students structured ways to rehearse new ideas.",
    "formative assessment":
      "You like to see understanding while there is still time to respond.",
    "formative checks":
      "Light checks during the lesson fit how you care for learning.",
    presentation: "Visual storytelling helps you open concepts gently.",
    "visual presentations":
      "Slides and images are tools you use to anchor attention.",
    "outdoor learning": "You trust the world outside the classroom as a teacher.",
    "hands-on": "Materials in students’ hands are central to your craft.",
    inquiry: "Questions before answers appear in your design language.",
    lecture: "Clear teacher explanation still has a place in your craft.",
    reflection: "You make space for students to notice their own learning.",
    "closing reflection": "Endings matter to you — not just coverage.",
    "clear lesson spine": "Your experiences tend to have a readable arc.",
    "short assessments": "Brief checks help you keep pacing kind.",
    "balanced pacing": "You notice when a lesson needs more breathing room.",
  };
  return `${map[label] ?? `“${label}” appears in how you design learning.`} ${base}.`;
}

function buildPatterns(
  versions: ExperienceVersion[],
  feedback: ClassFeedbackNote[],
): DnaPattern[] {
  const counters: Record<DnaDimensionId, Counter> = {
    methods: new Map(),
    structure: new Map(),
    assessment: new Map(),
    digital_tools: new Map(),
    activities: new Map(),
    timing: new Map(),
  };

  for (const version of versions) {
    for (const method of version.methods) {
      const dim = methodDimension(method);
      bump(counters[dim], method.toLowerCase(), version.schoolYear);
    }
    for (const resource of version.resources) {
      if (resource.status === "empty") continue;
      const signal = resourceSignal(resource.type);
      if (!signal) continue;
      bump(counters[signal.dimension], signal.key, version.schoolYear);
    }
    const ready = version.resources.filter((r) => r.status === "ready").length;
    if (ready >= 4) {
      bump(counters.structure, "clear lesson spine", version.schoolYear);
    }
    if (version.resources.some((r) => r.type === "assessment")) {
      bump(counters.timing, "short assessments", version.schoolYear);
    }
  }

  for (const note of feedback) {
    if (note.method) {
      const dim = methodDimension(note.method);
      bump(
        counters[dim],
        note.method.toLowerCase(),
        note.schoolYear,
        note.sentiment === "positive",
      );
    }
    if (/pacing|short assessment/i.test(note.pattern)) {
      bump(
        counters.timing,
        "balanced pacing",
        note.schoolYear,
        note.sentiment === "positive",
      );
    }
    if (/collaborative/i.test(note.pattern)) {
      bump(
        counters.activities,
        "collaborative activities",
        note.schoolYear,
        note.sentiment === "positive",
      );
    }
    if (/outdoor/i.test(note.pattern)) {
      bump(
        counters.activities,
        "outdoor learning",
        note.schoolYear,
        note.sentiment === "positive",
      );
    }
  }

  const patterns: DnaPattern[] = [];

  for (const dimension of Object.keys(counters) as DnaDimensionId[]) {
    const map = counters[dimension];
    const max = Math.max(1, ...[...map.values()].map((v) => v.count));
    for (const key of topKeys(map, 4)) {
      const entry = map.get(key)!;
      const presence = presenceFor(entry.count, max);
      patterns.push({
        id: `${dimension}_${key.replace(/\s+/g, "_")}`,
        dimension,
        label: key,
        narrative: narrativeFor(key, presence),
        presence,
        years: [...entry.years].sort(),
      });
    }
  }

  // Prefer signature / familiar first, keep calm length
  return patterns
    .sort((a, b) => {
      const order = { signature: 0, familiar: 1, emerging: 2 };
      return order[a.presence] - order[b.presence];
    })
    .slice(0, 18);
}

function buildDimensions(patterns: DnaPattern[]): DnaDimensionView[] {
  return (Object.keys(DIMENSION_META) as DnaDimensionId[]).map((id) => {
    const dimPatterns = patterns.filter((p) => p.dimension === id);
    const highlight = dimPatterns.find((p) => p.presence === "signature")
      ?? dimPatterns[0];
    return {
      id,
      ...DIMENSION_META[id],
      patterns: dimPatterns,
      highlight: highlight
        ? highlight.label.replace(/^\w/, (c) => c.toUpperCase())
        : undefined,
    };
  });
}

function buildEvolution(
  versions: ExperienceVersion[],
  patterns: DnaPattern[],
): DnaYearSnapshot[] {
  const years = [...new Set(versions.map((v) => v.schoolYear))].sort();

  return years.map((schoolYear) => {
    const yearPatterns = patterns.filter((p) => p.years.includes(schoolYear));
    const signatureLabels = yearPatterns
      .filter((p) => p.presence !== "emerging")
      .slice(0, 3)
      .map((p) => p.label);

    const note =
      signatureLabels.length > 0
        ? `In ${schoolYear}, your practice leaned toward ${signatureLabels.join(", ")}.`
        : `In ${schoolYear}, your pedagogical style was still gathering.`;

    return {
      schoolYear,
      signatureLabels,
      note,
      patternCount: yearPatterns.length,
    };
  });
}

function buildSignatureStyles(patterns: DnaPattern[]): string[] {
  const signatures = patterns.filter((p) => p.presence === "signature");
  const styles: string[] = [];

  if (signatures.some((p) => /collabor|hands|outdoor|activit/i.test(p.label))) {
    styles.push("Active learning designer");
  }
  if (signatures.some((p) => /formative|assess|exit|short/i.test(p.label))) {
    styles.push("Formative-minded planner");
  }
  if (signatures.some((p) => /game|digital|presentation/i.test(p.label))) {
    styles.push("Media-aware storyteller");
  }
  if (signatures.some((p) => /reflect|spine|structure/i.test(p.label))) {
    styles.push("Thoughtful lesson architect");
  }
  if (styles.length === 0) {
    styles.push("Reflective practitioner");
  }
  return styles.slice(0, 3);
}

function buildAdaptedSuggestions(
  patterns: DnaPattern[],
): DnaAdaptedSuggestion[] {
  const suggestions: DnaAdaptedSuggestion[] = [];
  const has = (re: RegExp) => patterns.some((p) => re.test(p.label));

  if (has(/collabor|hands|outdoor/i)) {
    suggestions.push({
      id: "dna_sug_collab",
      title: "Start with a shared make-and-talk",
      detail:
        "A short collaborative build before explanation often fits the way you already teach.",
      whyItFits: "Matches your active learning patterns",
      dimension: "activities",
    });
  }
  if (has(/formative|assess|short/i)) {
    suggestions.push({
      id: "dna_sug_exit",
      title: "Keep the exit ticket tiny",
      detail:
        "Two questions, one minute — your history shows short checks support your pacing.",
      whyItFits: "Matches your assessment preferences",
      dimension: "assessment",
    });
  }
  if (has(/game|digital/i)) {
    suggestions.push({
      id: "dna_sug_game",
      title: "Use a game as the discovery beat",
      detail:
        "A playful challenge can open the concept before the worksheet — in your style.",
      whyItFits: "Matches how you use digital tools",
      dimension: "digital_tools",
    });
  }
  if (has(/reflect|spine/i)) {
    suggestions.push({
      id: "dna_sug_reflect",
      title: "Protect a three-minute closing",
      detail:
        "A calm reflection fits the lesson spine you usually design.",
      whyItFits: "Matches your lesson structure",
      dimension: "structure",
    });
  }
  if (suggestions.length < 2) {
    suggestions.push({
      id: "dna_sug_default",
      title: "Design from what already feels natural",
      detail:
        "Choose one method you already like and let the rest of the lesson support it.",
      whyItFits: "Respects your emerging pedagogical DNA",
      dimension: "methods",
    });
  }

  return suggestions.slice(0, 4);
}

function buildSummary(
  firstName: string,
  styles: string[],
  experienceCount: number,
): string {
  const style = styles[0] ?? "reflective practitioner";
  return `${firstName}, your Pedagogical DNA reads as a ${style.toLowerCase()} — shaped across ${experienceCount} learning experience${experienceCount === 1 ? "" : "s"}. Not a score. A mirror of how you like to teach.`;
}

/**
 * Pure builder: classroom history → Pedagogical DNA.
 * Observes patterns. Never judges, scores, or ranks teachers.
 */
export function buildPedagogicalDna(input: {
  teacherFirstName: string;
  versions: ExperienceVersion[];
  feedback: ClassFeedbackNote[];
}): PedagogicalDnaProfile {
  const patterns = buildPatterns(input.versions, input.feedback);
  const dimensions = buildDimensions(patterns);
  const signatureStyles = buildSignatureStyles(patterns);
  const evolution = buildEvolution(input.versions, patterns);
  const adaptedSuggestions = buildAdaptedSuggestions(patterns);
  const projectIds = new Set(input.versions.map((v) => v.projectId));

  return {
    teacherFirstName: input.teacherFirstName,
    summary: buildSummary(
      input.teacherFirstName,
      signatureStyles,
      projectIds.size,
    ),
    signatureStyles,
    dimensions,
    patterns,
    evolution,
    adaptedSuggestions,
    experienceCount: projectIds.size,
    reflectionCount: input.feedback.length,
    generatedAt: new Date().toISOString(),
  };
}
