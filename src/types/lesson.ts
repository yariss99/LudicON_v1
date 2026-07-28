export type LessonStyleId =
  | "traditional"
  | "modern"
  | "inquiry"
  | "steam"
  | "gamified"
  | "inclusive";

export type LessonStatus = "draft" | "generated";

export type LessonGeneralInfo = {
  title: string;
  subject: string;
  grade: string;
  duration: number;
  date: string;
  author: string;
};

export type LessonCurriculum = {
  generalCompetencies: string[];
  specificCompetencies: string[];
  learningObjectives: string[];
};

export type LessonTeachingDesign = {
  teachingMethods: string[];
  teachingResources: string[];
  teachingMaterials: string[];
  classroomOrganization: string;
};

export type LessonSection = {
  id: string;
  title: string;
  durationMinutes: number;
  content: string;
};

export type GeneratedLessonContent = {
  summary: string;
  sections: LessonSection[];
  assessmentIdeas: string[];
  homework: string;
};

export type LessonDraft = {
  projectId: string;
  currentStep: number;
  general: LessonGeneralInfo;
  curriculum: LessonCurriculum;
  teaching: LessonTeachingDesign;
  style: LessonStyleId | null;
  updatedAt: string;
};

export type Lesson = {
  id: string;
  projectId: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  date: string;
  author: string;
  generalCompetencies: string[];
  specificCompetencies: string[];
  learningObjectives: string[];
  teachingMethods: string[];
  teachingResources: string[];
  teachingMaterials: string[];
  classroomOrganization: string;
  style: LessonStyleId;
  content: GeneratedLessonContent;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
};

export type LessonWizardStepId =
  | "general"
  | "curriculum"
  | "teaching"
  | "style"
  | "review";

export type LessonFormErrors = Partial<
  Record<
    | "title"
    | "subject"
    | "grade"
    | "duration"
    | "date"
    | "author"
    | "generalCompetencies"
    | "specificCompetencies"
    | "learningObjectives"
    | "teachingMethods"
    | "teachingResources"
    | "teachingMaterials"
    | "classroomOrganization"
    | "style",
    string
  >
>;
