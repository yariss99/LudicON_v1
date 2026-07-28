import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  AssistantContextPackage,
  AssistantMessage,
  AssistantValidationReport,
} from "../types";

/**
 * Every assistant response passes Validation Engine before the teacher sees it.
 */
export function validateAssistantResponse(input: {
  content: string;
  context: AssistantContextPackage;
  intent?: string;
}): AssistantValidationReport {
  const issues: AssistantValidationReport["issues"][number][] = [];

  if (!input.content.trim()) {
    issues.push({
      id: createId("avi"),
      severity: "error",
      code: "TA_EMPTY_RESPONSE",
      message: "Răspunsul AI este gol.",
    });
  }

  if (input.content.length < 24) {
    issues.push({
      id: createId("avi"),
      severity: "warning",
      code: "TA_TOO_SHORT",
      message: "Răspunsul este prea scurt pentru un co-pilot educațional.",
    });
  }

  // Must acknowledge educational context when a project is active
  if (input.context.projectId) {
    const mentionsContext =
      input.content.includes(input.context.projectTitle ?? "") ||
      input.content.toLowerCase().includes((input.context.subject ?? "").toLowerCase()) ||
      input.content.toLowerCase().includes("proiect") ||
      input.content.toLowerCase().includes("lecție") ||
      input.content.toLowerCase().includes("clas");
    if (!mentionsContext) {
      issues.push({
        id: createId("avi"),
        severity: "warning",
        code: "TA_CONTEXT_WEAK",
        message: "Răspunsul nu reflectă suficient contextul proiectului activ.",
      });
    }
  }

  // Guardrails: no claim of replacing the teacher
  if (/înlocuiesc profesorul|decide pentru tine|automatez nota/i.test(input.content)) {
    issues.push({
      id: createId("avi"),
      severity: "error",
      code: "TA_TEACHER_AGENCY",
      message: "Răspunsul încalcă principiul: profesorul decide.",
    });
  }

  if (
    input.context.competencies.length > 0 &&
    input.intent?.includes("create") &&
    !/competen|obiectiv|curriculum/i.test(input.content)
  ) {
    issues.push({
      id: createId("avi"),
      severity: "info",
      code: "TA_COMPETENCY_HINT",
      message: "Poți lega explicit răspunsul de competențele proiectului.",
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, 100 - errors * 40 - warnings * 12);
  const passed = errors === 0;

  return {
    passed,
    score,
    issues,
    validatedAt: nowIso(),
  };
}

export function applyValidationGate(
  message: Omit<AssistantMessage, "validation" | "blocked">,
  context: AssistantContextPackage,
): AssistantMessage {
  const validation = validateAssistantResponse({
    content: message.content,
    context,
    intent: message.intent,
  });

  if (!validation.passed) {
    return {
      ...message,
      content:
        "Nu pot livra acest răspuns încă — Validation Engine a blocat output-ul. " +
        "Reformulez în limitele PRIMA (context proiect, agenție profesor).\n\n" +
        validation.issues.map((i) => `• ${i.message}`).join("\n"),
      validation,
      blocked: true,
      role: "assistant",
    };
  }

  return { ...message, validation, blocked: false };
}
