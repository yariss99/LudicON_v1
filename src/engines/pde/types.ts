/**
 * FEATURE-005 — PDE runtime types (mirror of @prima/contracts prima-publishing-delivery).
 */

export type PublishDestinationId =
  | "print"
  | "digital_classroom"
  | "interactive_whiteboard"
  | "student_device"
  | "presentation_mode"
  | "learning_platform"
  | "assessment_platform"
  | "teacher_archive"
  | "school_repository"
  | string;

export type PublishChannelId =
  | "printable_worksheet"
  | "teacher_guide"
  | "student_version"
  | "presentation"
  | "interactive_lesson"
  | "homework_package"
  | "assessment_package"
  | "remedial_package"
  | "extension_package"
  | "portfolio_evidence"
  | string;

export type PublishFormatId =
  | "docx"
  | "pdf"
  | "pptx"
  | "html"
  | "markdown"
  | "scorm"
  | "ims_cc"
  | "json"
  | "png"
  | "svg"
  | string;

export type PublicationStatus =
  | "draft"
  | "pending"
  | "scheduled"
  | "published"
  | "failed"
  | "archived";

export type ReadinessCategoryId =
  | "pedagogical_quality"
  | "technical_integrity"
  | "accessibility"
  | "curriculum_alignment"
  | "completeness"
  | "publication_readiness";

export type PdePreviewKind =
  | "teacher"
  | "student"
  | "print"
  | "presentation"
  | "interactive"
  | "accessibility"
  | "mobile"
  | "tablet";

export type AccessibilityPublishOptions = {
  largePrint?: boolean;
  highContrast?: boolean;
  screenReader?: boolean;
  simplifiedLayout?: boolean;
  requireAltText?: boolean;
  languageAdaptation?: string;
  inclusiveFormatting?: boolean;
};

export type PublicationProfile = {
  id: string;
  nameRo: string;
  destination: PublishDestinationId;
  channel: PublishChannelId;
  format: PublishFormatId;
  accessibility: AccessibilityPublishOptions;
  requireAssessment: boolean;
  requireObjectives: boolean;
  includeTeacherNotes: boolean;
  theme?: string;
  language: string;
};

export type ReadinessFinding = {
  id: string;
  category: ReadinessCategoryId;
  severity: "blocking" | "warning" | "info";
  title: string;
  explanation: string;
  recommendation: string;
};

export type ReadinessReport = {
  ok: boolean;
  checkedAt: string;
  categories: Record<ReadinessCategoryId, number>;
  findings: ReadinessFinding[];
  pieOverall?: number;
};

export type DeliveryArtifact = {
  id: string;
  kind: "package" | "link" | "qr" | "access_code" | "embed";
  label: string;
  locator: string;
  expiresAt?: string;
};

export type PublicationRecord = {
  publicationId: string;
  schemaVersion: string;
  createdAt: string;
  status: PublicationStatus;
  destination: PublishDestinationId;
  channel: PublishChannelId;
  format: PublishFormatId;
  objectId: string;
  objectVersionId: string;
  objectTitle: string;
  lessonProjectId?: string;
  authorId: string;
  authorName: string;
  profileId?: string;
  previewKind: PdePreviewKind;
  readiness: ReadinessReport;
  artifacts: DeliveryArtifact[];
  accessibility: AccessibilityPublishOptions;
  reproducedFromPublicationId?: string;
};

export type PublishRequest = {
  objectId: string;
  objectVersionId: string;
  objectTitle: string;
  lessonProjectId?: string;
  destination: PublishDestinationId;
  channel: PublishChannelId;
  format: PublishFormatId;
  profileId?: string;
  previewKind: PdePreviewKind;
  previewCompleted: boolean;
  authorId: string;
  authorName: string;
  accessibility?: AccessibilityPublishOptions;
  pieOverall?: number;
  hasObjectives?: boolean;
  hasAssessment?: boolean;
  hasBrokenReferences?: boolean;
  hasUnsavedChanges?: boolean;
  missingAltText?: boolean;
  estimatedMinutes?: number;
  availableMinutes?: number;
};

export type PublishResult =
  | { ok: true; publication: PublicationRecord }
  | { ok: false; readiness: ReadinessReport; reason: string };
