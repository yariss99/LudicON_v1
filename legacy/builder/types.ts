import type { ComponentType } from "react";
import type { z } from "zod";
import type {
  AssetKind,
  Document,
  DocumentId,
  ProjectId,
  Timestamp,
  ValidationIssue,
  Version,
} from "@ludicon/domain";
import type { LucideIcon } from "lucide-react";

/**
 * The asset kinds that have an authoring surface.
 *
 * `AssetKind` has ten members. `worksheet` joined this list because it was the
 * most-chosen entry in the create menu and the only one of the six the flow
 * offers that had nowhere to land — a material a teacher can ask for and then
 * cannot open is a dead end, not a simplification. The remaining four (rubric,
 * homework, observation sheet, note) are still produced rather than authored,
 * so the route rejects them at the param boundary.
 */
export const BUILDER_KINDS = [
  "lesson_plan",
  "worksheet",
  "assessment",
  "story",
  "game",
  "presentation",
] as const satisfies readonly AssetKind[];

export type BuilderKind = (typeof BUILDER_KINDS)[number];

export function isBuilderKind(value: string): value is BuilderKind {
  return (BUILDER_KINDS as readonly string[]).includes(value);
}

/** A document as the builder sees it: envelope plus its per-kind body. */
export type BuilderDocument<TBody> = Document<TBody>;

/**
 * One step of the left-hand structure rail.
 *
 * `isComplete` drives the completion dot. It is deliberately a predicate on the
 * body rather than a stored flag: completion is derived from the work, never
 * something the teacher has to remember to tick.
 */
export type BuilderSection<TBody> = {
  id: string;
  /** Romanian label. Pedagogical noun, never an architecture term. */
  label: string;
  /** One short line explaining what belongs in this section. */
  hint: string;
  icon: LucideIcon;
  isComplete: (body: TBody) => boolean;
};

/**
 * A PRIMA recommendation.
 *
 * Capped at three by `useBuilder` (CH02 Law 8). `apply` is a pure body
 * transform so accepting a suggestion goes through the same patch path as
 * typing does — one undo story, one autosave story.
 */
export type BuilderSuggestion<TBody> = {
  id: string;
  /** What PRIMA noticed. A sentence, not a label. */
  title: string;
  /** Why it matters, in the teacher's language. */
  detail: string;
  /** Which section it concerns, so `Aplică` can scroll there. */
  sectionId: string;
  apply: (body: TBody) => TBody;
};

/** A quiet number in the side rail — never a grade, never a KPI strip. */
export type BuilderStat = {
  label: string;
  value: string;
};

export type EditorPaneProps<TBody> = {
  sectionId: string;
  body: TBody;
  issues: readonly ValidationIssue[];
  onChange: (next: TBody) => void;
};

/**
 * Everything one asset kind needs to become a builder.
 *
 * This is the whole per-type surface. The 17,140 LOC across five directories
 * collapsed to this shape plus one editor component each.
 */
export type BuilderConfig<TBody> = {
  kind: BuilderKind;
  bodySchema: z.ZodType<TBody>;
  /** A fresh body for a document that does not exist yet. */
  createBody: () => TBody;
  sections: readonly BuilderSection<TBody>[];
  /** Teacher-facing checks. Messages must satisfy UX-001. */
  validate: (document: BuilderDocument<TBody>) => ValidationIssue[];
  /** At most three are ever shown; `useBuilder` truncates. */
  suggest: (document: BuilderDocument<TBody>) => BuilderSuggestion<TBody>[];
  /** Side-rail summary numbers. */
  summarize: (body: TBody) => readonly BuilderStat[];
  EditorPane: ComponentType<EditorPaneProps<TBody>>;
};

/** Which side panel is open. Only one at a time — CH02 Law 2. */
export type BuilderPanel = "guidance" | "history" | null;

export type SaveState = "idle" | "saving" | "saved" | "failed";

/**
 * The 19 members every builder screen needs.
 *
 * The five hand-written hooks exposed the same list under five names. It is
 * one type now, and every consumer below is written once.
 */
export type BuilderContextValue<TBody> = {
  document: BuilderDocument<TBody>;
  versions: readonly Version<BuilderDocument<TBody>>[];
  sections: readonly BuilderSection<TBody>[];
  sectionId: string;
  panel: BuilderPanel;
  dirty: boolean;
  saving: SaveState;
  lastSavedAt: Timestamp | null;
  issues: readonly ValidationIssue[];
  suggestions: readonly BuilderSuggestion<TBody>[];
  setSectionId: (sectionId: string) => void;
  setPanel: (panel: BuilderPanel) => void;
  patch: (body: TBody) => void;
  renameTitle: (title: string) => void;
  saveNow: () => Promise<void>;
  runValidation: () => void;
  publish: () => Promise<void>;
  archive: () => Promise<void>;
  duplicate: () => Promise<DocumentId | null>;
  restoreVersion: (versionId: string) => Promise<void>;
  applySuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
};

export type BuilderRouteParams = {
  projectId: ProjectId;
  documentId: DocumentId;
};
