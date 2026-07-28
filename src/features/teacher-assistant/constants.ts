import type {
  AssistantCapability,
  AssistantIntentId,
  AssistantViewId,
  AssistantWorkflowStage,
} from "./types";

export const CAPABILITIES: readonly {
  id: AssistantCapability;
  label: string;
}[] = [
  { id: "create", label: "Creează" },
  { id: "edit", label: "Editează" },
  { id: "improve", label: "Îmbunătățește" },
  { id: "explain", label: "Explică" },
  { id: "simplify", label: "Simplifică" },
  { id: "differentiate", label: "Diferențiază" },
  { id: "adapt", label: "Adaptează" },
  { id: "translate", label: "Traduce" },
  { id: "summarize", label: "Rezumă" },
  { id: "validate", label: "Validează" },
  { id: "compare", label: "Compară" },
  { id: "review", label: "Revizuiește" },
  { id: "generate", label: "Generează" },
  { id: "organize", label: "Organizează" },
  { id: "recommend", label: "Recomandă" },
  { id: "reflect", label: "Reflectează" },
] as const;

export const WORKFLOW_STAGES: readonly {
  id: AssistantWorkflowStage;
  label: string;
}[] = [
  { id: "planning", label: "Planificare" },
  { id: "teaching", label: "Predare" },
  { id: "assessment", label: "Evaluare" },
  { id: "reflection", label: "Reflecție" },
  { id: "revision", label: "Revizuire" },
  { id: "portfolio", label: "Portofoliu" },
  { id: "reporting", label: "Raportare" },
] as const;

export const ASSISTANT_VIEWS: readonly {
  id: AssistantViewId;
  label: string;
}[] = [
  { id: "chat", label: "Conversație" },
  { id: "history", label: "Istoric" },
  { id: "context", label: "Context" },
  { id: "proactive", label: "Proactiv" },
  { id: "memory", label: "Memorie" },
  { id: "tools", label: "Tools" },
] as const;

export const EXAMPLE_PROMPTS: readonly string[] = [
  "Creează o fișă diferențiată.",
  "Transformă lecția în joc de clasă.",
  "Îmbunătățește evaluarea de azi.",
  "Sugerează activități pentru elevii care întâmpină dificultăți.",
  "Generează temă pentru acasă.",
  "Explică fracțiile prin storytelling.",
  "Creează o lecție de recapitulare.",
  "Generează întrebări pe taxonomia Bloom.",
  "Pregătește lecția de mâine.",
] as const;

export const INTENT_PATTERNS: readonly {
  id: AssistantIntentId;
  patterns: readonly string[];
  capabilities: readonly AssistantCapability[];
}[] = [
  {
    id: "create_worksheet",
    patterns: ["fișă", "fisa", "worksheet", "diferențiat"],
    capabilities: ["create", "differentiate", "generate"],
  },
  {
    id: "create_game",
    patterns: ["joc", "game", "transformă lecția", "turn lesson"],
    capabilities: ["create", "generate", "adapt"],
  },
  {
    id: "create_assessment",
    patterns: ["evaluare", "assessment", "test", "verificare"],
    capabilities: ["create", "generate", "validate"],
  },
  {
    id: "create_story",
    patterns: ["poveste", "story", "storytelling"],
    capabilities: ["create", "explain", "generate"],
  },
  {
    id: "create_presentation",
    patterns: ["prezentare", "slide", "presentation"],
    capabilities: ["create", "generate"],
  },
  {
    id: "create_lesson",
    patterns: ["lecție", "lectie", "lesson", "pregătește", "mâine"],
    capabilities: ["create", "generate", "organize"],
  },
  {
    id: "create_homework",
    patterns: ["temă", "tema", "homework"],
    capabilities: ["create", "generate"],
  },
  {
    id: "create_revision",
    patterns: ["recapitulare", "revision", "revisie"],
    capabilities: ["create", "summarize", "generate"],
  },
  {
    id: "improve_document",
    patterns: ["îmbunătățește", "imbunatateste", "improve"],
    capabilities: ["improve", "edit", "review"],
  },
  {
    id: "differentiate",
    patterns: ["diferenț", "struggling", "dificultăți", "adapt"],
    capabilities: ["differentiate", "adapt", "recommend"],
  },
  {
    id: "explain_with_story",
    patterns: ["explică", "explica", "prin poveste"],
    capabilities: ["explain", "generate"],
  },
  {
    id: "bloom_questions",
    patterns: ["bloom", "taxonom"],
    capabilities: ["generate", "validate"],
  },
  {
    id: "suggest_activities",
    patterns: ["activități", "activitati", "sugerează activ"],
    capabilities: ["recommend", "generate"],
  },
  {
    id: "prepare_tomorrow",
    patterns: ["mâine", "maine", "tomorrow", "pregătește"],
    capabilities: ["organize", "generate", "recommend"],
  },
  {
    id: "recommend_resources",
    patterns: ["resurse", "recomandă", "bibliotec"],
    capabilities: ["recommend"],
  },
  {
    id: "validate_work",
    patterns: ["validează", "valideaza", "validate", "verifică alinierea"],
    capabilities: ["validate", "review"],
  },
  {
    id: "reflect",
    patterns: ["reflect", "reflecție", "ce a mers"],
    capabilities: ["reflect", "summarize"],
  },
  {
    id: "summarize",
    patterns: ["rezum", "summar"],
    capabilities: ["summarize"],
  },
  {
    id: "translate",
    patterns: ["tradu", "translate", "englez"],
    capabilities: ["translate", "adapt"],
  },
  {
    id: "compare_documents",
    patterns: ["compar", "versus", "diferența dintre"],
    capabilities: ["compare", "review"],
  },
  {
    id: "organize",
    patterns: ["organizează", "ordonează", "workflow"],
    capabilities: ["organize", "recommend"],
  },
  {
    id: "workflow_guide",
    patterns: ["ghidează", "pași", "planificare", "portofoliu", "raport"],
    capabilities: ["organize", "recommend", "reflect"],
  },
] as const;

export const FLOATING_STORAGE_KEY = "prima.teacher-assistant.floating.v1";
