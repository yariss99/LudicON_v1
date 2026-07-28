/**
 * FEATURE-002 — Pedagogical Object Model (POM)
 * Canonical educational resource model. Content ⊥ presentation ⊥ export.
 * No infrastructure. No renderer implementations.
 */

export const PRIMA_PEDAGOGICAL_OBJECT_SCHEMA_VERSION = '1.0.0';

/** Open registry — known v1 types; new types need no schema redesign. */
export type PedagogicalObjectTypeId =
  | 'worksheet'
  | 'presentation'
  | 'assessment'
  | 'educational_game'
  | 'rubric'
  | 'lesson_plan'
  | 'homework'
  | 'differentiated_activity'
  | 'interactive_exercise'
  | 'poster'
  | 'certificate'
  | 'story'
  | 'flashcards'
  | 'escape_room'
  | 'mind_map'
  | (string & {});

export type PedagogicalBlockTypeId =
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'exercise'
  | 'question'
  | 'hint'
  | 'table'
  | 'timeline'
  | 'instruction'
  | 'reflection'
  | 'teacher_note'
  | 'divider'
  | 'quote'
  | 'media'
  | 'interactive'
  | (string & {});

export type PedagogicalObjectStatus =
  | 'draft'
  | 'needs_review'
  | 'ready'
  | 'published'
  | 'archived'
  | 'superseded';

export type DifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard' | 'mixed';

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create'
  | 'mixed'
  | 'unspecified';

export type DifferentiationLevel = 'support' | 'core' | 'extension' | 'mixed' | 'unspecified';

export type CognitiveLoadLevel = 'low' | 'medium' | 'high' | 'unspecified';

export type BlockVisibility =
  | 'teacher'
  | 'student'
  | 'both'
  | 'export_only'
  | 'hidden';

export type ObjectVersionKind = 'save' | 'restore' | 'branch' | 'duplicate' | 'merge';

export type RelationshipKind =
  | 'lesson'
  | 'competency'
  | 'objective'
  | 'activity'
  | 'object'
  | 'media'
  | 'template'
  | 'library';

export type ExportFormatId =
  | 'docx'
  | 'pdf'
  | 'pptx'
  | 'html'
  | 'markdown'
  | 'scorm'
  | 'learningapps'
  | 'wordwall'
  | 'genially'
  | 'google_classroom'
  | 'moodle'
  | (string & {});

export type PedagogicalValidationSeverity = 'error' | 'warning' | 'info';

export type AuthorKind = 'teacher' | 'prima' | 'system' | 'import';

export interface AuthorRef {
  readonly id: string;
  readonly displayName: string;
  readonly kind: AuthorKind;
}

export interface LessonReference {
  readonly lessonProjectId: string;
  readonly lessonVersionId?: string;
  readonly activityIds?: readonly string[];
}

export interface CompetencyRef {
  readonly id: string;
  readonly label: string;
  readonly code?: string;
}

export interface LearningObjectiveRef {
  readonly id: string;
  readonly statement: string;
}

export interface PedagogicalBlockLayout {
  readonly order: number;
  readonly columnSpan?: number;
  readonly pageBreakBefore?: boolean;
  readonly [key: string]: unknown;
}

export interface PedagogicalBlockStyle {
  readonly emphasis?: 'normal' | 'soft' | 'strong';
  readonly tokenHints?: readonly string[];
  readonly [key: string]: unknown;
}

export interface BlockDependency {
  readonly blockId?: string;
  readonly mediaId?: string;
  readonly reason?: string;
}

export interface BlockValidationState {
  readonly ok: boolean;
  readonly issueCodes?: readonly string[];
}

export interface PedagogicalBlock {
  readonly id: string;
  readonly type: PedagogicalBlockTypeId;
  readonly content: Record<string, unknown>;
  readonly layout: PedagogicalBlockLayout;
  readonly style?: PedagogicalBlockStyle;
  readonly visibility: BlockVisibility;
  readonly difficulty?: DifficultyLevel;
  readonly pedagogicalPurpose?: string;
  readonly dependencies?: readonly BlockDependency[];
  readonly validation?: BlockValidationState;
  readonly children?: readonly PedagogicalBlock[];
  readonly metadata?: Record<string, unknown>;
}

export interface IdToBlocksMapping {
  readonly [id: string]: readonly string[];
}

export interface PedagogicalMetadata {
  readonly learningObjectiveMapping: IdToBlocksMapping;
  readonly competencyMapping: IdToBlocksMapping;
  readonly assessmentMapping: IdToBlocksMapping;
  readonly bloomLevel: BloomLevel;
  readonly differentiationLevel: DifferentiationLevel;
  readonly estimatedCognitiveLoad: CognitiveLoadLevel;
  readonly requiredResources: readonly string[];
  readonly crossCurricularLinks: readonly string[];
  readonly inclusionNotes: string;
  readonly teacherNotes: string;
}

export interface ObjectRelationship {
  readonly kind: RelationshipKind;
  readonly targetId: string;
  readonly label?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ObjectValidationIssue {
  readonly code: string;
  readonly severity: PedagogicalValidationSeverity;
  readonly message: string;
  readonly path?: string;
}

export interface ObjectValidationSnapshot {
  readonly ok: boolean;
  readonly checkedAt: string;
  readonly issues: readonly ObjectValidationIssue[];
  readonly exportReady: boolean;
}

export interface PedagogicalObject {
  readonly id: string;
  readonly schemaVersion: string;
  readonly objectType: PedagogicalObjectTypeId;
  readonly title: string;
  readonly description: string;
  readonly subject: string;
  readonly grade: string;
  readonly lessonReference: LessonReference | null;
  readonly competencies: readonly CompetencyRef[];
  readonly learningObjectives: readonly LearningObjectiveRef[];
  readonly difficulty: DifficultyLevel;
  readonly estimatedTime?: number;
  readonly author: AuthorRef;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tags: readonly string[];
  readonly language: string;
  readonly curriculumVersion?: string;
  readonly status: PedagogicalObjectStatus;
  readonly version: string;
  readonly blocks: readonly PedagogicalBlock[];
  readonly pedagogy: PedagogicalMetadata;
  readonly relationships: readonly ObjectRelationship[];
  readonly validation: ObjectValidationSnapshot | null;
  readonly metadata?: Record<string, unknown>;
}

export interface PedagogicalObjectVersion {
  readonly id: string;
  readonly objectId: string;
  readonly versionLabel: string;
  readonly createdAt: string;
  readonly author: AuthorRef;
  readonly summary: string;
  readonly snapshot: PedagogicalObject;
  readonly parentVersionId?: string;
  readonly branchId?: string;
  readonly kind: ObjectVersionKind;
}

export interface RendererDescriptor {
  readonly id: string;
  readonly formats: readonly ExportFormatId[];
  readonly supportedObjectTypes: readonly PedagogicalObjectTypeId[] | '*';
}

export interface ExportArtifact {
  readonly format: ExportFormatId;
  readonly rendererId: string;
  readonly objectId: string;
  readonly objectVersionId: string;
  readonly createdAt: string;
  readonly contentType: string;
  /** Opaque locator (URL, storage key). Never the source of truth. */
  readonly locator: string;
}

export interface PedagogicalObjectTypeCatalogEntry {
  readonly objectType: PedagogicalObjectTypeId;
  readonly teacherLabelRo: string;
  readonly defaultBlocks: readonly PedagogicalBlockTypeId[];
}

export const PEDAGOGICAL_OBJECT_TYPE_CATALOG: readonly PedagogicalObjectTypeCatalogEntry[] = [
  { objectType: 'worksheet', teacherLabelRo: 'Fișă de lucru', defaultBlocks: ['heading', 'instruction', 'exercise'] },
  { objectType: 'presentation', teacherLabelRo: 'Prezentare', defaultBlocks: ['heading', 'paragraph', 'media'] },
  { objectType: 'assessment', teacherLabelRo: 'Evaluare', defaultBlocks: ['heading', 'instruction', 'question'] },
  { objectType: 'educational_game', teacherLabelRo: 'Joc educațional', defaultBlocks: ['heading', 'instruction', 'interactive'] },
  { objectType: 'rubric', teacherLabelRo: 'Rubrică', defaultBlocks: ['heading', 'table'] },
  { objectType: 'lesson_plan', teacherLabelRo: 'Plan de lecție', defaultBlocks: ['heading', 'timeline', 'teacher_note'] },
  { objectType: 'homework', teacherLabelRo: 'Temă pentru acasă', defaultBlocks: ['heading', 'instruction', 'exercise'] },
  {
    objectType: 'differentiated_activity',
    teacherLabelRo: 'Activitate diferențiată',
    defaultBlocks: ['heading', 'instruction', 'exercise', 'hint'],
  },
  {
    objectType: 'interactive_exercise',
    teacherLabelRo: 'Exercițiu interactiv',
    defaultBlocks: ['heading', 'interactive'],
  },
  { objectType: 'poster', teacherLabelRo: 'Poster', defaultBlocks: ['heading', 'image', 'paragraph'] },
  { objectType: 'certificate', teacherLabelRo: 'Diplomă / certificat', defaultBlocks: ['heading', 'paragraph'] },
  { objectType: 'story', teacherLabelRo: 'Poveste', defaultBlocks: ['heading', 'paragraph', 'reflection'] },
  { objectType: 'flashcards', teacherLabelRo: 'Fișe (flashcards)', defaultBlocks: ['heading', 'exercise'] },
  { objectType: 'escape_room', teacherLabelRo: 'Escape room', defaultBlocks: ['heading', 'instruction', 'interactive'] },
  { objectType: 'mind_map', teacherLabelRo: 'Hartă mentală', defaultBlocks: ['heading', 'media'] },
] as const;

export const KNOWN_BLOCK_TYPES: readonly PedagogicalBlockTypeId[] = [
  'heading',
  'paragraph',
  'image',
  'exercise',
  'question',
  'hint',
  'table',
  'timeline',
  'instruction',
  'reflection',
  'teacher_note',
  'divider',
  'quote',
  'media',
  'interactive',
] as const;

export function emptyPedagogicalMetadata(): PedagogicalMetadata {
  return {
    learningObjectiveMapping: {},
    competencyMapping: {},
    assessmentMapping: {},
    bloomLevel: 'unspecified',
    differentiationLevel: 'unspecified',
    estimatedCognitiveLoad: 'unspecified',
    requiredResources: [],
    crossCurricularLinks: [],
    inclusionNotes: '',
    teacherNotes: '',
  };
}

export function createPedagogicalBlock(
  partial: Pick<PedagogicalBlock, 'id' | 'type'> &
    Partial<Omit<PedagogicalBlock, 'id' | 'type'>> & {
      readonly content?: Record<string, unknown>;
      readonly layout?: Partial<PedagogicalBlockLayout>;
    },
): PedagogicalBlock {
  return {
    id: partial.id,
    type: partial.type,
    content: partial.content ?? {},
    layout: { order: 0, ...partial.layout },
    style: partial.style,
    visibility: partial.visibility ?? 'both',
    difficulty: partial.difficulty,
    pedagogicalPurpose: partial.pedagogicalPurpose,
    dependencies: partial.dependencies,
    validation: partial.validation,
    children: partial.children,
    metadata: partial.metadata,
  };
}

function collectBlockIds(
  blocks: readonly PedagogicalBlock[],
  into: Set<string> = new Set(),
): Set<string> {
  for (const block of blocks) {
    into.add(block.id);
    if (block.children?.length) collectBlockIds(block.children, into);
  }
  return into;
}

function walkBlocks(
  blocks: readonly PedagogicalBlock[],
  visit: (block: PedagogicalBlock, path: string) => void,
  pathPrefix = 'blocks',
): void {
  blocks.forEach((block, index) => {
    const path = `${pathPrefix}[${index}]`;
    visit(block, path);
    if (block.children?.length) {
      walkBlocks(block.children, visit, `${path}.children`);
    }
  });
}

/**
 * MVP structural + publishability validation (POM-V-*).
 * Teacher-facing messages belong in the UI layer (UX-002).
 */
export function validatePedagogicalObjectMvp(
  object: PedagogicalObject,
): ObjectValidationSnapshot {
  const issues: ObjectValidationIssue[] = [];
  const checkedAt = new Date().toISOString();

  if (!object.schemaVersion) {
    issues.push({
      code: 'POM-V-001',
      severity: 'error',
      message: 'Missing schemaVersion',
      path: 'schemaVersion',
    });
  }

  if (!object.title?.trim()) {
    issues.push({
      code: 'POM-V-002',
      severity: 'error',
      message: 'Title is required',
      path: 'title',
    });
  }

  if (!object.objectType?.trim()) {
    issues.push({
      code: 'POM-V-003',
      severity: 'error',
      message: 'objectType is required',
      path: 'objectType',
    });
  }

  if (!object.blocks?.length) {
    issues.push({
      code: 'POM-V-004',
      severity: 'error',
      message: 'At least one block is required',
      path: 'blocks',
    });
  }

  const ids = collectBlockIds(object.blocks ?? []);
  if (ids.size !== countBlocks(object.blocks ?? [])) {
    issues.push({
      code: 'POM-V-005',
      severity: 'error',
      message: 'Block ids must be unique',
      path: 'blocks',
    });
  }

  walkBlocks(object.blocks ?? [], (block, path) => {
    if (!block.type) {
      issues.push({
        code: 'POM-V-006',
        severity: 'error',
        message: 'Block type is required',
        path: `${path}.type`,
      });
    }

    for (const dep of block.dependencies ?? []) {
      if (dep.blockId && !ids.has(dep.blockId)) {
        issues.push({
          code: 'POM-V-007',
          severity: 'error',
          message: `Unresolved block dependency: ${dep.blockId}`,
          path: `${path}.dependencies`,
        });
      }
    }

    if (block.type === 'image') {
      const alt = block.content?.alt;
      if (typeof alt !== 'string' || !alt.trim()) {
        issues.push({
          code: 'POM-V-008',
          severity: 'warning',
          message: 'Image block missing alt text',
          path: `${path}.content.alt`,
        });
      }
    }
  });

  if (object.lessonReference) {
    if (!object.lessonReference.lessonProjectId?.trim()) {
      issues.push({
        code: 'POM-V-009',
        severity: 'error',
        message: 'lessonReference.lessonProjectId is required when lessonReference is set',
        path: 'lessonReference.lessonProjectId',
      });
    }
    if (!object.learningObjectives.length) {
      issues.push({
        code: 'POM-V-010',
        severity: 'warning',
        message: 'Lesson-linked object should map learning objectives',
        path: 'learningObjectives',
      });
    }
  }

  if (object.status === 'published' || object.status === 'ready') {
    if (!object.subject?.trim()) {
      issues.push({
        code: 'POM-V-011',
        severity: 'error',
        message: 'subject is required for ready/published status',
        path: 'subject',
      });
    }
    if (!object.grade?.trim()) {
      issues.push({
        code: 'POM-V-012',
        severity: 'error',
        message: 'grade is required for ready/published status',
        path: 'grade',
      });
    }
    if (!object.language?.trim()) {
      issues.push({
        code: 'POM-V-013',
        severity: 'error',
        message: 'language is required for ready/published status',
        path: 'language',
      });
    }
  }

  const hasError = issues.some((i) => i.severity === 'error');
  return {
    ok: !hasError,
    checkedAt,
    issues,
    exportReady: !hasError,
  };
}

function countBlocks(blocks: readonly PedagogicalBlock[]): number {
  let n = 0;
  walkBlocks(blocks, () => {
    n += 1;
  });
  return n;
}

/** Invariant: export artifacts are never treated as editable source. */
export function assertExportIsDerivative(artifact: ExportArtifact): ObjectValidationIssue[] {
  const issues: ObjectValidationIssue[] = [];
  if (!artifact.objectId || !artifact.objectVersionId) {
    issues.push({
      code: 'POM-V-020',
      severity: 'error',
      message: 'ExportArtifact must reference objectId and objectVersionId',
    });
  }
  if (!artifact.rendererId || !artifact.format) {
    issues.push({
      code: 'POM-V-021',
      severity: 'error',
      message: 'ExportArtifact must declare rendererId and format',
    });
  }
  return issues;
}

export function rendererSupports(
  renderer: RendererDescriptor,
  objectType: PedagogicalObjectTypeId,
): boolean {
  return renderer.supportedObjectTypes === '*' || renderer.supportedObjectTypes.includes(objectType);
}
