import type { ProjectResource } from "./project";

/**
 * Classroom Intelligence — teacher experience memory only.
 * Never profiles individual students. Never decides for the teacher.
 *
 * Individual (pseudonymous) learning profiles live in FEATURE-008 SLI
 * (`src/engines/sli/`) — instructional support, not evaluation.
 */

export type FeedbackSentiment = "positive" | "mixed" | "needs_work";

export type SearchFacet =
  | "competency"
  | "topic"
  | "method"
  | "resource"
  | "school_year"
  | "feedback";

/** A frozen snapshot of a learning experience the teacher can reopen */
export type ExperienceVersion = {
  id: string;
  projectId: string;
  version: number;
  savedAt: string;
  label: string;
  /** Teacher note on what changed — class-level, never student names */
  note?: string;
  title: string;
  subject: string;
  grade: string;
  resources: ProjectResource[];
  topics: string[];
  competencies: string[];
  methods: string[];
  schoolYear: string;
};

/**
 * Class-level teaching reflection.
 * Patterns about the experience — never about a named student.
 */
export type ClassFeedbackNote = {
  id: string;
  projectId: string;
  versionId?: string;
  schoolYear: string;
  recordedAt: string;
  topic?: string;
  competency?: string;
  method?: string;
  resourceLabel?: string;
  sentiment: FeedbackSentiment;
  /** Human pattern, e.g. "Collaborative activities worked well." */
  pattern: string;
};

export type ClassInsight = {
  id: string;
  title: string;
  detail: string;
  evidenceCount: number;
  method?: string;
  topic?: string;
  schoolYear?: string;
};

export type HistorySuggestion = {
  id: string;
  title: string;
  detail: string;
  basedOn: string;
  projectId?: string;
};

export type ExperienceEvolutionPoint = {
  versionId: string;
  version: number;
  label: string;
  savedAt: string;
  note?: string;
  resourceCount: number;
  readyCount: number;
  /** Simple 0–100 readiness signal for the visual spine */
  maturity: number;
};

export type ClassroomSearchQuery = {
  text: string;
  competency?: string;
  topic?: string;
  method?: string;
  resource?: string;
  schoolYear?: string;
  feedback?: FeedbackSentiment | "";
};

export type ClassroomSearchHit = {
  projectId: string;
  title: string;
  subject: string;
  grade: string;
  schoolYear: string;
  topics: string[];
  competencies: string[];
  methods: string[];
  matchedOn: SearchFacet[];
  latestVersionId: string;
  feedbackPreview?: string;
};

export type ClassroomIntelligenceStore = {
  versions: ExperienceVersion[];
  feedback: ClassFeedbackNote[];
};
