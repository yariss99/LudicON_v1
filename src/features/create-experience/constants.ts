import type {

  BlueprintProgressId,

  ConversationTopicId,

  SectionStatus,

} from "./types";



/** Teacher-facing section labels for the lesson plan */

export const PROGRESS_SECTIONS: Array<{

  id: BlueprintProgressId;

  label: string;

}> = [

  { id: "learning_context", label: "Contextul lecției" },

  { id: "competencies", label: "Competențe" },

  { id: "objectives", label: "Obiective" },

  { id: "learning_flow", label: "Parcursul lecției" },

  { id: "activities", label: "Activități" },

  { id: "assessment", label: "Evaluare" },

  { id: "resources", label: "Resurse" },

  { id: "differentiation", label: "Diferențiere" },

  { id: "reflection", label: "Reflecție" },

];



export const SECTION_STATUS_LABEL: Record<SectionStatus, string> = {

  not_started: "Neînceput",

  in_progress: "În lucru",

  completed: "Completat",

  needs_review: "De revăzut",

};



export const TOPIC_ORDER: ConversationTopicId[] = [

  "opening",

  "learning_context",

  "competencies",

  "objectives",

  "learning_flow",

  "activities",

  "assessment",

  "resources",

  "differentiation",

  "reflection",

  "wrap_up",

];



export const TOPIC_TO_SECTION: Partial<

  Record<ConversationTopicId, BlueprintProgressId>

> = {

  learning_context: "learning_context",

  competencies: "competencies",

  objectives: "objectives",

  learning_flow: "learning_flow",

  activities: "activities",

  assessment: "assessment",

  resources: "resources",

  differentiation: "differentiation",

  reflection: "reflection",

};



export const PRIMARY_QUESTION =

  "Ce ar trebui să poată face elevii tăi la finalul acestei lecții?" as const;



export const PRIMARY_QUESTION_HINT =

  "Scrie liber — descrie rezultatul în cuvintele tale. Nu există câmpuri de completat." as const;



export const WRITING_PLACEHOLDER =

  "Elevii vor putea să…" as const;



export const CONTINUE_LABEL = "Continuă" as const;



export const AI_SUGGESTION_SEED =

  "Elevii vor putea să explice o fracție ca părți egale ale unui întreg și să reprezinte fracții simple prin desene și exemple din viața de zi cu zi." as const;



export const SECONDARY_OPTIONS = [

  {

    id: "curriculum",

    label: "Pornește de la curriculum",

    description: "Începe de la o unitate sau un standard curricular.",

    available: false,

  },

  {

    id: "template",

    label: "Pornește de la un model",

    description: "Folosește un tipar didactic dovedit.",

    available: false,

  },

  {

    id: "previous",

    label: "Continuă lecția anterioară",

    description: "Reia de unde ai rămas pe birou.",

    available: true,

  },

  {

    id: "ai_suggestion",

    label: "Sugestie PRIMA",

    description: "Începe de la un exemplu de rezultat clar.",

    available: true,

  },

] as const;



export {

  CANVAS_NEW_HIGHLIGHT_MS,

  CANVAS_SECTIONS,

  CANVAS_STATE_LABEL,

  LEARNING_CANVAS_EMPTY_HINT,

  LEARNING_CANVAS_FIELDS,

  LEARNING_CANVAS_TITLE,

  UNDERSTANDING_LABEL,

} from "./constants/canvas";



export const WELCOME_MESSAGE =

  "Salut!\n\nDespre ce lecție vrei să vorbim azi?\n\nPoți răspunde natural — de exemplu:\n„Vreau o lecție de Matematică pentru clasa a III-a despre fracții.”\nsau\n„Nu am o idee clară. Ajută-mă.”";



export const EMPTY_HEADLINE = "Hai să creăm următoarea ta lecție.";



export const STREAMING_LABELS = [

  "Ascultăm ce contează pentru elevii tăi…",

  "Actualizăm planul lecției…",

  "Pregătim următorul pas…",

] as const;



export const SECTION_HIGHLIGHT_MS = 2200;


