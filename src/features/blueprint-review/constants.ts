import type { ReviewSectionId } from "./types";



/** Teacher-facing review section labels */

export const REVIEW_SECTIONS: Array<{

  id: ReviewSectionId;

  title: string;

}> = [

  { id: "learning_context", title: "Contextul lecției" },

  { id: "competencies", title: "Competențe" },

  { id: "objectives", title: "Obiective de învățare" },

  { id: "learning_flow", title: "Parcursul lecției" },

  { id: "activities", title: "Activități de învățare" },

  { id: "assessment", title: "Evaluare" },

  { id: "resources", title: "Resurse" },

  { id: "differentiation", title: "Diferențiere" },

  { id: "reflection", title: "Reflecție" },

];



export const REVIEW_STORAGE_KEY = "prima.blueprint.review.v1";



export const VALIDATION_STATUS_LABEL = {

  excellent: "Excelent",

  good: "Bine",

  needs_review: "De revăzut",

  incomplete: "Incomplet",

} as const;



export const NAV_STATUS_LABEL = {

  completed: "Completat",

  needs_review: "De revăzut",

  incomplete: "Incomplet",

} as const;


