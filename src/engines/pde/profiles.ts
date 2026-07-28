import type { PublicationProfile } from "./types";

export const DEFAULT_PUBLICATION_PROFILES: PublicationProfile[] = [
  {
    id: "classroom_print",
    nameRo: "Print pentru clasă",
    destination: "print",
    channel: "printable_worksheet",
    format: "pdf",
    accessibility: { requireAltText: true },
    requireAssessment: false,
    requireObjectives: true,
    includeTeacherNotes: false,
    language: "ro",
  },
  {
    id: "hybrid_lesson",
    nameRo: "Lecție hibridă",
    destination: "digital_classroom",
    channel: "interactive_lesson",
    format: "html",
    accessibility: { screenReader: true, requireAltText: true },
    requireAssessment: true,
    requireObjectives: true,
    includeTeacherNotes: true,
    language: "ro",
  },
  {
    id: "interactive_lesson",
    nameRo: "Lecție interactivă",
    destination: "student_device",
    channel: "interactive_lesson",
    format: "html",
    accessibility: { simplifiedLayout: true, requireAltText: true },
    requireAssessment: false,
    requireObjectives: true,
    includeTeacherNotes: false,
    language: "ro",
  },
  {
    id: "homework",
    nameRo: "Temă pentru acasă",
    destination: "student_device",
    channel: "homework_package",
    format: "pdf",
    accessibility: { requireAltText: true },
    requireAssessment: false,
    requireObjectives: true,
    includeTeacherNotes: false,
    language: "ro",
  },
  {
    id: "inspection_portfolio",
    nameRo: "Pachet de inspecție",
    destination: "school_repository",
    channel: "portfolio_evidence",
    format: "pdf",
    accessibility: { requireAltText: true, inclusiveFormatting: true },
    requireAssessment: true,
    requireObjectives: true,
    includeTeacherNotes: true,
    language: "ro",
  },
  {
    id: "differentiated_learning",
    nameRo: "Învățare diferențiată",
    destination: "digital_classroom",
    channel: "extension_package",
    format: "html",
    accessibility: { simplifiedLayout: true, requireAltText: true },
    requireAssessment: true,
    requireObjectives: true,
    includeTeacherNotes: true,
    language: "ro",
  },
];

export function getPublicationProfile(
  id: string,
): PublicationProfile | undefined {
  return DEFAULT_PUBLICATION_PROFILES.find((p) => p.id === id);
}

export const DESTINATION_LABELS_RO: Record<string, string> = {
  print: "Print",
  digital_classroom: "Clasă digitală",
  interactive_whiteboard: "Tablă interactivă",
  student_device: "Dispozitiv elev",
  presentation_mode: "Mod prezentare",
  learning_platform: "Platformă de învățare",
  assessment_platform: "Platformă de evaluare",
  teacher_archive: "Arhivă profesor",
  school_repository: "Repository școlar",
};

export const FORMAT_LABELS: Record<string, string> = {
  pdf: "PDF",
  docx: "DOCX",
  pptx: "PPTX",
  html: "HTML",
  markdown: "Markdown",
  scorm: "SCORM",
  ims_cc: "IMS CC",
  json: "JSON",
  png: "PNG",
  svg: "SVG",
};
