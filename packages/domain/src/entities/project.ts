import { z } from "zod";
import { ProjectId, TeacherId, Timestamp } from "../primitives/identifiers.js";
import { AssetKind, GradeLevel } from "../primitives/shared.js";

/**
 * Where a project sits in the one unbroken product loop:
 *   intent -> discovery -> design -> APPROVAL GATE -> generation -> edit -> publish
 *
 * `approved` is the binding gate. Nothing may be generated before it — that is
 * the product's central constitutional rule (Teacher Authority), not a UI
 * nicety, so it is modelled here in the domain rather than in a component.
 */
export const ProjectState = z.enum([
  "discovery",
  "design",
  "approved",
  "materials_ready",
  "published",
]);
export type ProjectState = z.infer<typeof ProjectState>;

/** Generation is authorized only by teacher approval. */
export const canGenerateMaterials = (state: ProjectState): boolean =>
  state === "approved" || state === "materials_ready" || state === "published";

export const ProjectColor = z.enum([
  "blue",
  "emerald",
  "amber",
  "slate",
  "rose",
  "teal",
]);
export type ProjectColor = z.infer<typeof ProjectColor>;

/**
 * A material the teacher intends to produce once the design is approved.
 *
 * This existed before and was referenced nowhere, which is why the chosen kind
 * ended up smuggled inside the project title as `"Fișă de lucru: <topic>"`. It
 * is now the project's own record of what it is for.
 */
export const PlannedMaterial = z.object({
  kind: AssetKind,
  selected: z.boolean().default(false),
});
export type PlannedMaterial = z.infer<typeof PlannedMaterial>;

export const Project = z.object({
  id: ProjectId,
  ownerId: TeacherId,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(""),
  subject: z.string().min(1).max(120),
  grade: GradeLevel,
  /**
   * What the teacher set out to make, chosen at intent capture.
   *
   * A type is not a name: the title carries the teacher's topic and this
   * carries the kind, so a list can show both without either being parsed out
   * of the other.
   */
  intendedKind: AssetKind.default("lesson_plan"),
  /** What the teacher intends to produce from the approved design. */
  plannedMaterials: z.array(PlannedMaterial).default([]),
  color: ProjectColor.default("blue"),
  state: ProjectState.default("discovery"),
  favorite: z.boolean().default(false),
  archived: z.boolean().default(false),
  /** When it was put away. `null` whenever `archived` is false. */
  archivedAt: Timestamp.nullable().default(null),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type Project = z.infer<typeof Project>;

/**
 * `archivedAt` is deliberately absent: putting a project away is a transition
 * with its own function below, never a field write, so a stray patch cannot
 * leave `archived` and `archivedAt` disagreeing.
 */
export const ProjectDraft = Project.omit({
  id: true,
  ownerId: true,
  archivedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type ProjectDraft = z.infer<typeof ProjectDraft>;

export const ProjectPatch = ProjectDraft.partial();
export type ProjectPatch = z.infer<typeof ProjectPatch>;

export const isArchived = (project: Project): boolean => project.archived;

/**
 * Puts a project away, keeping everything it owns.
 *
 * Archiving is reversible and lossless — it is the answer to "not now", not to
 * "never". Deletion is the other thing, and it lives in the data layer because
 * it has to reach records this function cannot see.
 */
export const archiveProject = (project: Project, at: Timestamp): Project => ({
  ...project,
  archived: true,
  archivedAt: at,
  updatedAt: at,
});

export const restoreProject = (project: Project, at: Timestamp): Project => ({
  ...project,
  archived: false,
  archivedAt: null,
  updatedAt: at,
});

/** The kinds this project is currently set on producing. */
export const plannedKinds = (project: Project): AssetKind[] =>
  project.plannedMaterials
    .filter((material) => material.selected)
    .map((material) => material.kind);

/**
 * Records a new set of intended materials without forgetting the old ones.
 *
 * A kind the teacher once asked for stays in the list as `selected: false`
 * rather than vanishing, so the picker can show what was considered before.
 */
export const withPlannedKinds = (
  project: Project,
  kinds: readonly AssetKind[],
): PlannedMaterial[] => {
  const chosen = new Set<AssetKind>(kinds);
  const known = new Set(
    project.plannedMaterials.map((material) => material.kind),
  );

  return [
    ...project.plannedMaterials.map((material) => ({
      ...material,
      selected: material.selected || chosen.has(material.kind),
    })),
    ...kinds
      .filter((kind) => !known.has(kind))
      .map((kind) => ({ kind, selected: true })),
  ];
};
