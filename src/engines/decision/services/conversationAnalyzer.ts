import type {
  ConversationState,
  ConversationUtterance,
  ExtractedPedagogicalInfo,
  LearningContextFacts,
  TeacherCorrection,
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

function extractListItem(text: string): string {
  return text.replace(/^[-•\d.)\s]+/, "").trim();
}

function isLost(text: string): boolean {
  return /no idea|don'?t know|help me|nu știu|ajută|ajuta-ma|idee/i.test(
    text.trim(),
  );
}

function isUnclear(text: string): boolean {
  return text.trim().length > 0 && text.trim().length < 8;
}

function isCorrection(text: string): boolean {
  return /^(actually|no[, ]|not |instead|correction|wait[, ]|nu[, ]|de fapt)/i.test(
    text.trim(),
  );
}

/**
 * Conversation Analyzer — updates context and extracts pedagogical cues.
 * Independent service; does not decide next questions.
 */
export async function analyzeConversation(input: {
  teacherMessage: string;
  conversation: ConversationState;
  currentSectionHint?: string;
}): Promise<{
  conversation: ConversationState;
  extracted: ExtractedPedagogicalInfo;
}> {
  const text = input.teacherMessage.trim();
  const utterance: ConversationUtterance = {
    role: "teacher",
    content: text,
    at: new Date().toISOString(),
    objectiveId: input.conversation.currentObjectiveId ?? undefined,
  };

  const conversation: ConversationState = {
    ...input.conversation,
    utterances: [...input.conversation.utterances, utterance],
  };

  const contextHints: LearningContextFacts = {
    grade: matchGrade(text),
    subject: matchSubject(text),
    topic: matchTopic(text),
    durationMinutes: matchDuration(text),
    summary: text.slice(0, 240) || undefined,
  };

  const item = extractListItem(text);
  const corrections: TeacherCorrection[] = [];

  if (isCorrection(text)) {
    const grade = matchGrade(text);
    const subject = matchSubject(text);
    const topic = matchTopic(text);
    if (grade) {
      corrections.push({
        sectionId: "learning_context",
        field: "grade",
        newValue: grade,
        rawText: text,
      });
    }
    if (subject) {
      corrections.push({
        sectionId: "learning_context",
        field: "subject",
        newValue: subject,
        rawText: text,
      });
    }
    if (topic) {
      corrections.push({
        sectionId: "learning_context",
        field: "topic",
        newValue: topic,
        rawText: text,
      });
    }
    if (!grade && !subject && !topic && item) {
      corrections.push({
        sectionId: "learning_context",
        newValue: item,
        rawText: text,
      });
    }
  }

  const extracted: ExtractedPedagogicalInfo = {
    facts: {
      learningContext: contextHints,
    },
    corrections,
    unclear: isUnclear(text),
    lost: isLost(text),
    rawEvidence: text,
  };

  // Map free-text into the active objective section when not opening context
  const objective = conversation.currentObjectiveId;
  if (item && !isLost(text) && !extracted.unclear) {
    if (objective === "capture_competencies") {
      extracted.facts.competencies = [item];
    } else if (objective === "capture_objectives") {
      extracted.facts.objectives = [item];
    } else if (objective === "capture_learning_flow") {
      extracted.facts.learningFlow = [item];
    } else if (objective === "capture_activities") {
      extracted.facts.activities = [item];
    } else if (objective === "capture_assessment") {
      extracted.facts.assessment = [item];
    } else if (objective === "capture_resources") {
      extracted.facts.resources = [item];
    } else if (objective === "capture_differentiation") {
      extracted.facts.differentiation = [item];
    } else if (objective === "capture_reflection") {
      extracted.facts.reflection = [item];
    }
  }

  // Opening / context turns may still carry list-free context
  if (
    !objective ||
    objective === "capture_learning_context" ||
    objective === "clarify_low_confidence"
  ) {
    extracted.facts.learningContext = contextHints;
  }

  return { conversation, extracted };
}

export function createEmptyConversation(): ConversationState {
  return {
    utterances: [],
    askedObjectives: [],
    askedQuestions: [],
    currentObjectiveId: null,
  };
}
