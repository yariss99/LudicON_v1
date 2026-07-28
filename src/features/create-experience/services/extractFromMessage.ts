import type {
  BlueprintDraft,
  BlueprintProgressId,
  LearningContextDraft,
} from "../types";

/** Lightweight NL cues — pedagogical heuristics, not a model redefine */

function matchGrade(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/grade\s*iii|clasa\s*a?\s*iii|class\s*iii|a\s*iii-a|3rd|year\s*3/.test(lower)) {
    return "Clasa a III-a";
  }
  if (/grade\s*iv|clasa\s*a?\s*iv|class\s*iv|a\s*iv-a|4th/.test(lower)) {
    return "Clasa a IV-a";
  }
  if (/grade\s*ii|clasa\s*a?\s*ii[^i]|class\s*ii\b|a\s*ii-a|2nd/.test(lower)) {
    return "Clasa a II-a";
  }
  if (/grade\s*i\b|clasa\s*a?\s*i\b|1st/.test(lower)) {
    return "Clasa a I-a";
  }
  return undefined;
}

function matchSubject(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/math|matematic/.test(lower)) return "Matematică";
  if (/science|științ|stiint|biologie|fizic/.test(lower)) return "Științe";
  if (/român|romana|limba român|literacy|reading|citire/.test(lower)) {
    return "Limba română";
  }
  if (/istor/.test(lower)) return "Istorie";
  if (/geograf/.test(lower)) return "Geografie";
  return undefined;
}

function matchTopic(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (/fraction|fracț|fractii|fracții/.test(lower)) return "fractions";
  if (/plant|fotosintez|photosynth/.test(lower)) return "plants";
  if (/noun|substantiv/.test(lower)) return "nouns";
  const about = text.match(/about\s+([^.!?\n]{3,40})/i);
  if (about) return about[1].trim();
  const despre = text.match(/despre\s+([^.!?\n]{3,40})/i);
  if (despre) return despre[1].trim();
  return undefined;
}

function matchDuration(text: string): number | undefined {
  const m = text.match(/(\d{1,2})\s*(min|minutes|minute)/i);
  if (m) return Number(m[1]);
  if (/one\s*hour|o\s*oră|60\s*min/i.test(text)) return 60;
  return undefined;
}

export function extractContextHints(text: string): Partial<LearningContextDraft> {
  return {
    grade: matchGrade(text),
    subject: matchSubject(text),
    topic: matchTopic(text),
    durationMinutes: matchDuration(text),
    summary: text.trim().slice(0, 240) || undefined,
  };
}

export function looksLost(text: string): boolean {
  return /no idea|don'?t know|help me|nu știu|ajută|ajuta-ma|idee/i.test(
    text.trim(),
  );
}

export function mergeContext(
  current: LearningContextDraft,
  hints: Partial<LearningContextDraft>,
): LearningContextDraft {
  return {
    grade: hints.grade ?? current.grade,
    subject: hints.subject ?? current.subject,
    topic: hints.topic ?? current.topic,
    durationMinutes: hints.durationMinutes ?? current.durationMinutes,
    language: hints.language ?? current.language ?? "ro",
    summary: hints.summary ?? current.summary,
  };
}

export function contextCompleteness(ctx: LearningContextDraft): number {
  let n = 0;
  if (ctx.grade) n += 1;
  if (ctx.subject) n += 1;
  if (ctx.topic) n += 1;
  if (ctx.durationMinutes) n += 0.5;
  return n;
}

export function extractListItem(text: string): string {
  return text.replace(/^[-•\d.)\s]+/, "").trim();
}

function appendUnique(list: string[], item: string): string[] {
  const normalized = item.toLowerCase();
  if (list.some((entry) => entry.toLowerCase() === normalized)) return list;
  return [...list, item];
}

function pushItem(
  draft: BlueprintDraft,
  key: Exclude<
    keyof BlueprintDraft,
    "status" | "learningContext" | "needsReview"
  >,
  text: string,
): void {
  const item = extractListItem(text);
  if (!item || looksLost(text)) return;
  draft[key] = appendUnique(draft[key], item);
}

/**
 * Apply teacher utterance to the discovery draft for the active topic.
 */
export function applyExtraction(
  draft: BlueprintDraft,
  text: string,
  topic: string,
): BlueprintDraft {
  const next = structuredClone(draft);
  next.status = "in_discovery";
  next.needsReview = { ...next.needsReview };

  if (topic === "opening" || topic === "learning_context") {
    next.learningContext = mergeContext(
      next.learningContext,
      extractContextHints(text),
    );
  }

  if (topic === "competencies") pushItem(next, "competencies", text);
  if (topic === "objectives") pushItem(next, "objectives", text);
  if (topic === "learning_flow") pushItem(next, "learningFlow", text);
  if (topic === "activities") pushItem(next, "activities", text);
  if (topic === "assessment") pushItem(next, "assessment", text);
  if (topic === "resources") pushItem(next, "resources", text);
  if (topic === "differentiation") pushItem(next, "differentiation", text);
  if (topic === "reflection") pushItem(next, "reflection", text);

  return next;
}

export function markNeedsReview(
  draft: BlueprintDraft,
  sectionId: BlueprintProgressId | undefined,
  needs: boolean,
): BlueprintDraft {
  if (!sectionId) return draft;
  const next = structuredClone(draft);
  next.needsReview = { ...next.needsReview, [sectionId]: needs };
  return next;
}
