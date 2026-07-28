/**
 * Pedagogical DNA — professional teaching style patterns.
 * Never personality. Never judgment. Never scores or ranks.
 */

export type DnaDimensionId =
  | "methods"
  | "structure"
  | "assessment"
  | "digital_tools"
  | "activities"
  | "timing";

/** Qualitative familiarity — not a grade */
export type DnaPresence = "emerging" | "familiar" | "signature";

export type DnaPattern = {
  id: string;
  dimension: DnaDimensionId;
  label: string;
  /** Warm, positive description of the pattern */
  narrative: string;
  presence: DnaPresence;
  /** School years where this appeared */
  years: string[];
};

export type DnaDimensionView = {
  id: DnaDimensionId;
  title: string;
  subtitle: string;
  patterns: DnaPattern[];
  highlight?: string;
};

export type DnaYearSnapshot = {
  schoolYear: string;
  signatureLabels: string[];
  note: string;
  patternCount: number;
};

export type DnaAdaptedSuggestion = {
  id: string;
  title: string;
  detail: string;
  /** Why this fits their style — never pressure */
  whyItFits: string;
  dimension: DnaDimensionId;
};

export type PedagogicalDnaProfile = {
  teacherFirstName: string;
  summary: string;
  signatureStyles: string[];
  dimensions: DnaDimensionView[];
  patterns: DnaPattern[];
  evolution: DnaYearSnapshot[];
  adaptedSuggestions: DnaAdaptedSuggestion[];
  experienceCount: number;
  reflectionCount: number;
  generatedAt: string;
};
