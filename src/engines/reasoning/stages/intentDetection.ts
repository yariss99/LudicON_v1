/**
 * AI-001 Step 1 — Intent Detection
 * Identify teaching goal, topic, pedagogical intention, phase, etc.
 */

import type {
  DetectedEntities,
  IntentDetectionResult,
  PedagogicalIntentKind,
} from "../types";

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
  if (about) return about[1]!.trim();
  const despre = text.match(/despre\s+([^.!?\n]{3,40})/i);
  if (despre) return despre[1]!.trim();
  return undefined;
}

function classifyIntent(text: string): {
  intent: PedagogicalIntentKind;
  confidence: number;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { intent: "unknown", confidence: 0.2 };
  }

  if (
    /generate|worksheet|presentation|create\s+(a\s+)?(quiz|game|slide)/i.test(
      trimmed,
    )
  ) {
    return { intent: "generation_request", confidence: 0.85 };
  }
  if (
    /actually|instead|correction|change\s+that|not\s+that|de fapt|^no[, ]/i.test(
      trimmed,
    )
  ) {
    return { intent: "revision", confidence: 0.8 };
  }
  if (
    /reflect|what\s+worked|how\s+did\s+(it|the lesson)|after\s+the\s+lesson/i.test(
      trimmed,
    )
  ) {
    return { intent: "reflection", confidence: 0.75 };
  }
  if (
    /^(what|why|how|when|where|which|can\s+you|could\s+you|\?)/i.test(trimmed) ||
    trimmed.endsWith("?")
  ) {
    return { intent: "question", confidence: 0.7 };
  }
  if (
    /opening|warm[- ]?up|practice|closure|assessment\s+phase|lesson\s+phase/i.test(
      trimmed,
    )
  ) {
    return { intent: "lesson_phase", confidence: 0.7 };
  }
  if (
    /students?\s+(will|should|can|are able)|able to|by the end|learning objective/i.test(
      trimmed,
    )
  ) {
    return { intent: "teaching_goal", confidence: 0.88 };
  }
  if (
    /differenti|inquiry|direct instruction|collaborat|scaffol|competenc/i.test(
      trimmed,
    )
  ) {
    return { intent: "pedagogical_intention", confidence: 0.72 };
  }
  if (matchTopic(trimmed) || /about |despre /i.test(trimmed)) {
    return { intent: "topic", confidence: 0.78 };
  }
  if (matchSubject(trimmed) || matchGrade(trimmed)) {
    return { intent: "topic", confidence: 0.65 };
  }

  return { intent: "unknown", confidence: 0.45 };
}

export function detectIntent(teacherMessage: string): IntentDetectionResult {
  const text = teacherMessage.trim();
  const { intent, confidence } = classifyIntent(text);

  const detectedEntities: DetectedEntities = {
    grade: matchGrade(text),
    subject: matchSubject(text),
    topic: matchTopic(text),
  };

  const duration = text.match(/(\d{1,2})\s*(min|minutes|minute)/i);
  if (duration) {
    detectedEntities.durationMinutes = Number(duration[1]);
  }

  if (intent === "teaching_goal") {
    detectedEntities.objectiveSnippet =
      text.length > 160 ? `${text.slice(0, 157)}…` : text;
  }

  return {
    intent,
    confidence,
    detectedEntities,
    evidence: text.slice(0, 160),
  };
}
