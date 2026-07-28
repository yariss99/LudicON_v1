/**
 * FEATURE-005 — Publishing & Delivery Engine (PDE) contracts.
 * Destination-oriented publishing over Pedagogical Objects.
 * No LMS OAuth. No binary renderer implementations.
 */

export const PRIMA_PDE_SCHEMA_VERSION = '1.0.0';

export type PublishDestinationId =
  | 'print'
  | 'digital_classroom'
  | 'interactive_whiteboard'
  | 'student_device'
  | 'presentation_mode'
  | 'learning_platform'
  | 'assessment_platform'
  | 'teacher_archive'
  | 'school_repository'
  | (string & {});

export type PublishChannelId =
  | 'printable_worksheet'
  | 'teacher_guide'
  | 'student_version'
  | 'presentation'
  | 'interactive_lesson'
  | 'homework_package'
  | 'assessment_package'
  | 'remedial_package'
  | 'extension_package'
  | 'portfolio_evidence'
  | (string & {});

export type PublishFormatId =
  | 'docx'
  | 'pdf'
  | 'pptx'
  | 'html'
  | 'markdown'
  | 'scorm'
  | 'ims_cc'
  | 'json'
  | 'png'
  | 'svg'
  | (string & {});

export type LmsPlatformId =
  | 'google_classroom'
  | 'microsoft_teams'
  | 'moodle'
  | 'canvas'
  | 'schoology'
  | (string & {});

export type InteractivePlatformId =
  | 'learningapps'
  | 'wordwall'
  | 'genially'
  | 'nearpod'
  | 'kahoot'
  | 'quizizz'
  | 'book_creator'
  | (string & {});

export type PublicationStatus =
  | 'draft'
  | 'pending'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'archived';

export type ReadinessCategoryId =
  | 'pedagogical_quality'
  | 'technical_integrity'
  | 'accessibility'
  | 'curriculum_alignment'
  | 'completeness'
  | 'publication_readiness';

export type PdePreviewKind =
  | 'teacher'
  | 'student'
  | 'print'
  | 'presentation'
  | 'interactive'
  | 'accessibility'
  | 'mobile'
  | 'tablet';

export type AccessibilityPublishOptions = {
  readonly largePrint?: boolean;
  readonly highContrast?: boolean;
  readonly screenReader?: boolean;
  readonly simplifiedLayout?: boolean;
  readonly requireAltText?: boolean;
  readonly languageAdaptation?: string;
  readonly inclusiveFormatting?: boolean;
};

export interface PublicationProfile {
  readonly id: string;
  readonly nameRo: string;
  readonly destination: PublishDestinationId;
  readonly channel: PublishChannelId;
  readonly format: PublishFormatId;
  readonly accessibility: AccessibilityPublishOptions;
  readonly requireAssessment: boolean;
  readonly requireObjectives: boolean;
  readonly includeTeacherNotes: boolean;
  readonly theme?: string;
  readonly language: string;
}

export interface ReadinessFinding {
  readonly id: string;
  readonly category: ReadinessCategoryId;
  readonly severity: 'blocking' | 'warning' | 'info';
  readonly title: string;
  readonly explanation: string;
  readonly recommendation: string;
}

export interface ReadinessReport {
  readonly ok: boolean;
  readonly checkedAt: string;
  readonly categories: Readonly<Record<ReadinessCategoryId, number>>;
  readonly findings: readonly ReadinessFinding[];
  readonly pieOverall?: number;
}

export interface DeliveryArtifact {
  readonly id: string;
  readonly kind: 'package' | 'link' | 'qr' | 'access_code' | 'embed';
  readonly label: string;
  readonly locator: string;
  readonly expiresAt?: string;
}

export interface PublicationRecord {
  readonly publicationId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly status: PublicationStatus;
  readonly destination: PublishDestinationId;
  readonly channel: PublishChannelId;
  readonly format: PublishFormatId;
  readonly objectId: string;
  readonly objectVersionId: string;
  readonly objectTitle: string;
  readonly lessonProjectId?: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly profileId?: string;
  readonly previewKind: PdePreviewKind;
  readonly readiness: ReadinessReport;
  readonly artifacts: readonly DeliveryArtifact[];
  readonly accessibility: AccessibilityPublishOptions;
  readonly reproducedFromPublicationId?: string;
}

export interface PublishRequest {
  readonly objectId: string;
  readonly objectVersionId: string;
  readonly objectTitle: string;
  readonly lessonProjectId?: string;
  readonly destination: PublishDestinationId;
  readonly channel: PublishChannelId;
  readonly format: PublishFormatId;
  readonly profileId?: string;
  readonly previewKind: PdePreviewKind;
  /** Session flag — must be true (PDE-I03) */
  readonly previewCompleted: boolean;
  readonly authorId: string;
  readonly authorName: string;
  readonly accessibility?: AccessibilityPublishOptions;
  readonly pieOverall?: number;
  readonly hasObjectives?: boolean;
  readonly hasAssessment?: boolean;
  readonly hasBrokenReferences?: boolean;
  readonly hasUnsavedChanges?: boolean;
  readonly missingAltText?: boolean;
  readonly estimatedMinutes?: number;
  readonly availableMinutes?: number;
}

export const DEFAULT_PUBLICATION_PROFILES: readonly PublicationProfile[] = [
  {
    id: 'classroom_print',
    nameRo: 'Print pentru clasă',
    destination: 'print',
    channel: 'printable_worksheet',
    format: 'pdf',
    accessibility: { largePrint: false, requireAltText: true },
    requireAssessment: false,
    requireObjectives: true,
    includeTeacherNotes: false,
    language: 'ro',
  },
  {
    id: 'hybrid_lesson',
    nameRo: 'Lecție hibridă',
    destination: 'digital_classroom',
    channel: 'interactive_lesson',
    format: 'html',
    accessibility: { screenReader: true, requireAltText: true },
    requireAssessment: true,
    requireObjectives: true,
    includeTeacherNotes: true,
    language: 'ro',
  },
  {
    id: 'interactive_lesson',
    nameRo: 'Lecție interactivă',
    destination: 'student_device',
    channel: 'interactive_lesson',
    format: 'html',
    accessibility: { simplifiedLayout: true, requireAltText: true },
    requireAssessment: false,
    requireObjectives: true,
    includeTeacherNotes: false,
    language: 'ro',
  },
  {
    id: 'homework',
    nameRo: 'Temă pentru acasă',
    destination: 'student_device',
    channel: 'homework_package',
    format: 'pdf',
    accessibility: { requireAltText: true },
    requireAssessment: false,
    requireObjectives: true,
    includeTeacherNotes: false,
    language: 'ro',
  },
  {
    id: 'inspection_portfolio',
    nameRo: 'Pachet de inspecție',
    destination: 'school_repository',
    channel: 'portfolio_evidence',
    format: 'pdf',
    accessibility: { requireAltText: true, inclusiveFormatting: true },
    requireAssessment: true,
    requireObjectives: true,
    includeTeacherNotes: true,
    language: 'ro',
  },
  {
    id: 'differentiated_learning',
    nameRo: 'Învățare diferențiată',
    destination: 'digital_classroom',
    channel: 'extension_package',
    format: 'html',
    accessibility: { simplifiedLayout: true, requireAltText: true },
    requireAssessment: true,
    requireObjectives: true,
    includeTeacherNotes: true,
    language: 'ro',
  },
] as const;

export function getPublicationProfile(id: string): PublicationProfile | undefined {
  return DEFAULT_PUBLICATION_PROFILES.find((p) => p.id === id);
}

export const DESTINATION_LABELS_RO: Readonly<Record<string, string>> = {
  print: 'Print',
  digital_classroom: 'Clasă digitală',
  interactive_whiteboard: 'Tablă interactivă',
  student_device: 'Dispozitiv elev',
  presentation_mode: 'Mod prezentare',
  learning_platform: 'Platformă de învățare',
  assessment_platform: 'Platformă de evaluare',
  teacher_archive: 'Arhivă profesor',
  school_repository: 'Repository școlar',
};
