import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type { Project } from "../../../types/project";
import { INTENT_PATTERNS } from "../constants";
import type {
  AssistantCapability,
  AssistantContextPackage,
  AssistantIntentId,
  AssistantMessage,
} from "../types";
import { applyValidationGate } from "./assistantValidation";
import { planToolsForIntent, summarizeProjectAssets } from "./assistantTools";
import { assistantRepository } from "./assistantRepository";

export type OrchestrationPromptPackage = {
  readonly system: string;
  readonly user: string;
  readonly intent: AssistantIntentId;
  readonly engines: readonly string[];
  readonly projectId?: string;
};

export function detectIntent(utterance: string): {
  intent: AssistantIntentId;
  capabilities: readonly AssistantCapability[];
} {
  const text = utterance.toLowerCase();
  let best: {
    intent: AssistantIntentId;
    capabilities: readonly AssistantCapability[];
    score: number;
  } = {
    intent: "general_help",
    capabilities: ["recommend"],
    score: 0,
  };

  for (const entry of INTENT_PATTERNS) {
    let score = 0;
    for (const pattern of entry.patterns) {
      if (text.includes(pattern.toLowerCase())) score += 1;
    }
    if (score > best.score) {
      best = {
        intent: entry.id,
        capabilities: entry.capabilities,
        score,
      };
    }
  }
  return { intent: best.intent, capabilities: best.capabilities };
}

function buildResponseBody(input: {
  utterance: string;
  intent: AssistantIntentId;
  context: AssistantContextPackage;
  toolNotes: readonly string[];
}): string {
  const ctx = input.context;
  const projectLine = ctx.projectTitle
    ? `În proiectul „${ctx.projectTitle}” (${ctx.subject ?? "—"}, ${ctx.grade ?? "—"})`
    : "Nu ai un proiect activ — pot ghida alegerea unuia";
  const lessonLine = ctx.lessonTitle
    ? `Lecția curentă: „${ctx.lessonTitle}”.`
    : "Nu este selectată o lecție anume.";
  const docLine = ctx.documentTitle
    ? `Document: ${ctx.documentKind} „${ctx.documentTitle}”.`
    : "";
  const compLine = ctx.competencies.length
    ? `Competențe în focus: ${ctx.competencies.slice(0, 4).join("; ")}.`
    : "Competențele proiectului nu sunt încă mapate.";
  const objLine = ctx.learningObjectives.length
    ? `Obiective: ${ctx.learningObjectives.slice(0, 3).join("; ")}.`
    : "";
  const memLine = ctx.preferences.format
    ? `Țin cont de preferința ta: ${ctx.preferences.format}.`
    : "";
  const rel =
    ctx.relatedAssets.length > 0
      ? `Relații: ${ctx.relatedAssets
          .slice(0, 5)
          .map((a) => `${a.kind}:${a.title}`)
          .join(" · ")}.`
      : "";
  const assets = ctx.projectId
    ? summarizeProjectAssets(ctx.projectId)
    : "fără proiect";

  const intentCopy: Partial<Record<AssistantIntentId, string>> = {
    create_worksheet:
      "Propun o fișă diferențiată pe 2–3 niveluri, aliniată obiectivelor lecției.",
    create_game:
      "Transform conținutul lecției într-un joc de clasă (mecanici + întrebări), fără canvas gol.",
    create_assessment:
      "Pregătesc o evaluare formativă cu itemi pe niveluri Bloom și criterii clare.",
    create_story:
      "Construiesc o poveste didactică care explică conceptul pentru clasă.",
    create_presentation:
      "Generez o prezentare de lecție cu flux pedagogic (titlu → obiective → activitate → rezumat).",
    create_lesson: "Schițez structura lecției pe faze PRIMA.",
    create_homework: "Propun temă scurtă, verificabilă, legată de obiective.",
    create_revision: "Creez o lecție de recapitulare pe competențele slabe.",
    improve_document:
      "Analizez documentul curent și propun îmbunătățiri de claritate, ritm și aliniere.",
    differentiate:
      "Sugerez variante pentru elevii care întâmpină dificultăți și pentru cei avansați.",
    explain_with_story:
      "Explic conceptul prin storytelling scurt, potrivit nivelului clasei.",
    bloom_questions:
      "Generez seturi de întrebări pe taxonomia Bloom (cunoaștere → creare).",
    suggest_activities:
      "Recomand activități scurte pe etapele lecției, inclusiv pentru ritm diferențiat.",
    prepare_tomorrow:
      "Pregătesc un plan pentru mâine: obiective, resurse, evaluare, temă.",
    recommend_resources:
      "Caut în Resource Center resurse reutilizabile, pe disciplină și clasă.",
    validate_work:
      "Trec răspunsul și artefactele prin Validation Engine — tu rămâi decidentul final.",
    reflect:
      "Te ghidez într-o reflecție scurtă: ce a mers, ce ajustezi, ce reții în Memory Engine.",
    summarize: "Rezum contextul și artefactele proiectului pentru decizie rapidă.",
    translate: "Propun o variantă bilingvă (RO↔EN) a materialului, fără a pierde intenția pedagogică.",
    compare_documents:
      "Compar artefactele legate (lecție / fișă / evaluare) pentru consistență.",
    organize: "Propun o ordine de lucru: planificare → generare → validare → publicare.",
    workflow_guide:
      "Te ghidez pe fluxul educațional (planificare, predare, evaluare, reflecție, portofoliu).",
    general_help:
      "Spune-mi ce vrei să creezi sau să îmbunătățești — lucrez doar în contextul tău PRIMA.",
  };

  return [
    `${projectLine}. ${lessonLine} ${docLine}`.trim(),
    intentCopy[input.intent] ?? intentCopy.general_help,
    compLine,
    objLine,
    `Bibliotecă: ${ctx.resourceCount} resurse indexate · artefacte proiect: ${assets}.`,
    ctx.validationSummary ? `Validare: ${ctx.validationSummary}` : null,
    ctx.curriculumRef ? `Curriculum: ${ctx.curriculumRef}` : null,
    memLine,
    rel,
    input.toolNotes.length ? input.toolNotes.join(" ") : null,
    "Tu decizi ce aplici — PRIMA observă, sugerează și acționează cu unelte, nu înlocuiește profesorul.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildOrchestrationPrompt(input: {
  utterance: string;
  intent: AssistantIntentId;
  context: AssistantContextPackage;
}): OrchestrationPromptPackage {
  return {
    system:
      "PRIMA Teacher AI Assistant — educational co-pilot. Always context-aware. Teacher remains in control. Responses must pass Validation Engine.",
    user: [
      `Teacher: ${input.context.teacherName}`,
      `Project: ${input.context.projectTitle ?? "n/a"}`,
      `Lesson: ${input.context.lessonTitle ?? "n/a"}`,
      `Document: ${input.context.documentKind ?? "n/a"} ${input.context.documentTitle ?? ""}`,
      `Subject/Grade: ${input.context.subject ?? "—"} / ${input.context.grade ?? "—"}`,
      `Workflow: ${input.context.workflowStage}`,
      `Competencies: ${input.context.competencies.join("; ") || "—"}`,
      `Utterance: ${input.utterance}`,
      `Intent: ${input.intent}`,
    ].join("\n"),
    intent: input.intent,
    projectId: input.context.projectId,
    engines: [
      "WorkflowEngine",
      "ContextEngine",
      "PromptBuilder",
      "AiOrchestrator",
      "ValidationEngine",
      "MemoryEngine",
      "ToolEngine",
      "KnowledgeEngine",
      "Runtime",
    ],
  };
}

export function runAssistantTurn(input: {
  utterance: string;
  context: AssistantContextPackage;
  project?: Project;
}): {
  teacherMessage: AssistantMessage;
  assistantMessage: AssistantMessage;
  prompt: OrchestrationPromptPackage;
} {
  const { intent, capabilities } = detectIntent(input.utterance);
  const toolResult = planToolsForIntent({
    intent,
    context: input.context,
    project: input.project,
    utterance: input.utterance,
  });

  const teacherMessage: AssistantMessage = {
    id: createId("tmsg"),
    role: "teacher",
    content: input.utterance.trim(),
    createdAt: nowIso(),
    contextSnapshot: {
      projectId: input.context.projectId,
      lessonId: input.context.lessonId,
      documentId: input.context.documentId,
      workflowStage: input.context.workflowStage,
    },
  };

  const draft: Omit<AssistantMessage, "validation" | "blocked"> = {
    id: createId("amsg"),
    role: "assistant",
    content: buildResponseBody({
      utterance: input.utterance,
      intent,
      context: input.context,
      toolNotes: toolResult.notes,
    }),
    createdAt: nowIso(),
    intent,
    capabilities,
    toolCalls: toolResult.tools,
    contextSnapshot: {
      projectId: input.context.projectId,
      lessonId: input.context.lessonId,
      subject: input.context.subject,
      grade: input.context.grade,
    },
  };

  const assistantMessage = applyValidationGate(draft, input.context);
  const prompt = buildOrchestrationPrompt({
    utterance: input.utterance,
    intent,
    context: input.context,
  });

  // Memory: remember frequent workflows / project
  if (input.context.projectId) {
    assistantRepository.rememberPreference(
      input.context.teacherId,
      "project",
      input.context.projectId,
    );
  }
  assistantRepository.rememberPreference(
    input.context.teacherId,
    "workflow",
    `${input.context.workflowStage}:${intent}`,
  );

  return { teacherMessage, assistantMessage, prompt };
}

export function summarizeConversation(
  messages: readonly AssistantMessage[],
): string {
  const teacherBits = messages
    .filter((m) => m.role === "teacher")
    .map((m) => m.content)
    .slice(-3);
  const intents = messages
    .filter((m) => m.intent)
    .map((m) => m.intent)
    .slice(-5);
  return [
    teacherBits.length ? `Cereri: ${teacherBits.join(" / ")}` : "Fără mesaje",
    intents.length ? `Intenții: ${intents.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" · ")
    .slice(0, 220);
}
