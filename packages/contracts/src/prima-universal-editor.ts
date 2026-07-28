/**
 * FEATURE-004 — Universal Pedagogical Editor (UPE) contracts.
 * Workspace chrome + block operations over Pedagogical Objects.
 * Does not implement UI or renderers.
 */

export const PRIMA_UPE_SCHEMA_VERSION = '1.0.0';

export type UpePreviewMode =
  | 'printable'
  | 'presentation'
  | 'student'
  | 'mobile'
  | 'interactive'
  | 'accessibility';

export type UpeBottomTab =
  | 'comments'
  | 'history'
  | 'validation'
  | 'compare'
  | 'export';

export type UpeLeftTab =
  | 'objects'
  | 'structure'
  | 'library'
  | 'templates'
  | 'media';

export type UpeRightTab =
  | 'properties'
  | 'pedagogy'
  | 'design'
  | 'accessibility'
  | 'alignment'
  | 'recommendations';

export type UpeBlockOperation =
  | 'move'
  | 'duplicate'
  | 'lock'
  | 'unlock'
  | 'hide'
  | 'show'
  | 'reuse'
  | 'convert'
  | 'delete'
  | 'annotate';

export type UpeAutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type UpeValidationIssueSeverity = 'error' | 'warning' | 'info';

export interface UpeObjectProfile {
  readonly objectType: string;
  readonly teacherLabelRo: string;
  readonly defaultBlockTypes: readonly string[];
  readonly supportedPreviewModes: readonly UpePreviewMode[];
  readonly canvasHintRo: string;
}

export interface UpeValidationIssue {
  readonly id: string;
  readonly severity: UpeValidationIssueSeverity;
  readonly title: string;
  readonly explanation: string;
  readonly suggestedFix: string;
  readonly estimatedImpact: string;
  readonly blockId?: string;
  readonly source: 'pom' | 'pie' | 'upe';
}

export interface UpeSearchHit {
  readonly id: string;
  readonly kind:
    | 'block'
    | 'activity'
    | 'competency'
    | 'objective'
    | 'resource'
    | 'image'
    | 'template'
    | 'curriculum'
    | 'library';
  readonly title: string;
  readonly excerpt: string;
  readonly blockId?: string;
}

export interface UpeSelection {
  readonly blockId: string | null;
  readonly multiBlockIds?: readonly string[];
}

export interface UpeWorkspaceChrome {
  readonly leftTab: UpeLeftTab;
  readonly rightTab: UpeRightTab;
  readonly bottomTab: UpeBottomTab;
  readonly previewMode: UpePreviewMode;
  readonly searchQuery: string;
  readonly selection: UpeSelection;
  readonly bottomOpen: boolean;
}

export interface UpeVersionSummary {
  readonly id: string;
  readonly label: string;
  readonly createdAt: string;
  readonly summary: string;
  readonly kind: 'autosave' | 'named' | 'restore' | 'branch' | 'duplicate';
}

export const UPE_OBJECT_PROFILES: readonly UpeObjectProfile[] = [
  {
    objectType: 'worksheet',
    teacherLabelRo: 'Fișă de lucru',
    defaultBlockTypes: ['heading', 'instruction', 'exercise', 'hint'],
    supportedPreviewModes: ['printable', 'student', 'mobile', 'accessibility'],
    canvasHintRo: 'Composează exercițiile pe canvas — elevii văd varianta fără notele tale.',
  },
  {
    objectType: 'presentation',
    teacherLabelRo: 'Prezentare',
    defaultBlockTypes: ['heading', 'paragraph', 'media', 'divider'],
    supportedPreviewModes: ['presentation', 'student', 'mobile'],
    canvasHintRo: 'Fiecare secțiune poate deveni un slide în previzualizare.',
  },
  {
    objectType: 'assessment',
    teacherLabelRo: 'Evaluare',
    defaultBlockTypes: ['heading', 'instruction', 'question', 'success_criteria'],
    supportedPreviewModes: ['printable', 'student', 'accessibility'],
    canvasHintRo: 'Leagă fiecare item de un obiectiv din proiectul lecției.',
  },
  {
    objectType: 'educational_game',
    teacherLabelRo: 'Joc educațional',
    defaultBlockTypes: ['heading', 'instruction', 'interactive'],
    supportedPreviewModes: ['interactive', 'student', 'mobile'],
    canvasHintRo: 'Blochele interactive se previzualizează în modul elev.',
  },
  {
    objectType: 'homework',
    teacherLabelRo: 'Temă pentru acasă',
    defaultBlockTypes: ['heading', 'instruction', 'exercise'],
    supportedPreviewModes: ['printable', 'student', 'mobile'],
    canvasHintRo: 'Păstrează instrucțiuni clare și un timp estimat realist.',
  },
  {
    objectType: 'lesson_timeline',
    teacherLabelRo: 'Desfășurarea lecției',
    defaultBlockTypes: ['timeline', 'teacher_note'],
    supportedPreviewModes: ['printable', 'accessibility'],
    canvasHintRo: 'Editează momentele lecției ca pe o linie a timpului.',
  },
  {
    objectType: 'poster',
    teacherLabelRo: 'Poster',
    defaultBlockTypes: ['heading', 'image', 'paragraph'],
    supportedPreviewModes: ['printable', 'student'],
    canvasHintRo: 'Prioritizează un mesaj vizual clar.',
  },
  {
    objectType: 'certificate',
    teacherLabelRo: 'Diplomă / certificat',
    defaultBlockTypes: ['heading', 'paragraph'],
    supportedPreviewModes: ['printable'],
    canvasHintRo: 'Textul scurt și lizibil câștigă în fața ornamentelor.',
  },
  {
    objectType: 'flashcards',
    teacherLabelRo: 'Fișe (flashcards)',
    defaultBlockTypes: ['heading', 'exercise'],
    supportedPreviewModes: ['interactive', 'student', 'mobile'],
    canvasHintRo: 'Fiecare card este un bloc reutilizabil.',
  },
  {
    objectType: 'mind_map',
    teacherLabelRo: 'Hartă mentală',
    defaultBlockTypes: ['heading', 'media'],
    supportedPreviewModes: ['printable', 'student'],
    canvasHintRo: 'Structurează ideile — exportul rămâne un derivat.',
  },
  {
    objectType: 'escape_room',
    teacherLabelRo: 'Escape room',
    defaultBlockTypes: ['heading', 'instruction', 'interactive', 'hint'],
    supportedPreviewModes: ['interactive', 'student'],
    canvasHintRo: 'Provocările și indiciile sunt blocuri legate între ele.',
  },
  {
    objectType: 'story',
    teacherLabelRo: 'Poveste',
    defaultBlockTypes: ['heading', 'paragraph', 'reflection'],
    supportedPreviewModes: ['printable', 'student', 'mobile'],
    canvasHintRo: 'Narațiunea rămâne pe canvas; reflecția poate fi ascunsă la export.',
  },
  {
    objectType: 'reflection_journal',
    teacherLabelRo: 'Jurnal de reflecție',
    defaultBlockTypes: ['heading', 'reflection', 'prompt'],
    supportedPreviewModes: ['printable', 'student', 'accessibility'],
    canvasHintRo: 'Întrebările de reflecție ghidează metacogniția.',
  },
  {
    objectType: 'rubric',
    teacherLabelRo: 'Rubrică',
    defaultBlockTypes: ['heading', 'table'],
    supportedPreviewModes: ['printable', 'student', 'accessibility'],
    canvasHintRo: 'Criteriile din tabel trebuie să oglindească obiectivele.',
  },
] as const;

export function getUpeObjectProfile(objectType: string): UpeObjectProfile | undefined {
  return UPE_OBJECT_PROFILES.find((p) => p.objectType === objectType);
}

export function defaultUpeWorkspaceChrome(): UpeWorkspaceChrome {
  return {
    leftTab: 'structure',
    rightTab: 'properties',
    bottomTab: 'validation',
    previewMode: 'student',
    searchQuery: '',
    selection: { blockId: null },
    bottomOpen: true,
  };
}
