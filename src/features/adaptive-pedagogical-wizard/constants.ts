import type {
  AdaptiveStepDef,
  AvailableResourceId,
  ClassProfile,
  InterviewAnswers,
  LearningOrganization,
  LessonDuration,
  LessonPurpose,
} from "./types";

export const INTERVIEW_STORAGE_KEY = "prima.adaptive-pedagogical-wizard.v1";

export const PURPOSE_OPTIONS: readonly {
  id: LessonPurpose;
  label: string;
  hint: string;
}[] = [
  {
    id: "introduction",
    label: "Introduction",
    hint: "First encounter with a new idea",
  },
  {
    id: "consolidation",
    label: "Consolidation",
    hint: "Strengthen and practice understanding",
  },
  {
    id: "review",
    label: "Review",
    hint: "Revisit before a check or next unit",
  },
  {
    id: "assessment",
    label: "Assessment",
    hint: "Check understanding and competencies",
  },
  {
    id: "remedial",
    label: "Remedial",
    hint: "Support learners who need another path",
  },
  {
    id: "enrichment",
    label: "Enrichment",
    hint: "Extend learning for curious students",
  },
] as const;

export const CLASS_PROFILE_OPTIONS: readonly {
  id: ClassProfile;
  label: string;
  hint: string;
}[] = [
  { id: "typical", label: "Typical", hint: "Standard class pace" },
  {
    id: "mixed_ability",
    label: "Mixed ability",
    hint: "Wide range of readiness",
  },
  {
    id: "high_performing",
    label: "High performing",
    hint: "Ready for challenge and depth",
  },
  {
    id: "support_needed",
    label: "Support needed",
    hint: "Scaffolding and paced guidance",
  },
  {
    id: "demonstration",
    label: "Demonstration lesson",
    hint: "Observed / showcase teaching",
  },
] as const;

export const DURATION_OPTIONS: readonly LessonDuration[] = [30, 40, 50, 90];

export const ORGANIZATION_OPTIONS: readonly {
  id: LearningOrganization;
  label: string;
  hint: string;
}[] = [
  { id: "individual", label: "Individual", hint: "Independent work" },
  { id: "pair", label: "Pair work", hint: "Think–pair–share style" },
  { id: "groups", label: "Groups", hint: "Collaborative teams" },
  { id: "mixed", label: "Mixed", hint: "Blend of formats" },
] as const;

export const RESOURCE_OPTIONS: readonly {
  id: AvailableResourceId;
  label: string;
}[] = [
  { id: "manual", label: "Manual" },
  { id: "worksheet", label: "Worksheet" },
  { id: "projector", label: "Projector" },
  { id: "interactive_board", label: "Interactive board" },
  { id: "tablets", label: "Tablets" },
  { id: "manipulatives", label: "Manipulatives" },
  { id: "other", label: "Other" },
] as const;

export const STEP_DEFS: Record<
  AdaptiveStepDef["id"],
  AdaptiveStepDef
> = {
  topic: {
    id: "topic",
    title: "Lesson topic",
    prompt: "What will this lesson be about?",
  },
  purpose: {
    id: "purpose",
    title: "Lesson purpose",
    prompt: "What is the pedagogical role of this lesson?",
  },
  class_profile: {
    id: "class_profile",
    title: "Class profile",
    prompt: "Who are you teaching today?",
  },
  duration: {
    id: "duration",
    title: "Lesson duration",
    prompt: "How much time do you have?",
  },
  organization: {
    id: "organization",
    title: "Learning organization",
    prompt: "How should students work?",
  },
  resources: {
    id: "resources",
    title: "Available resources",
    prompt: "What can you use in the classroom?",
  },
  summary: {
    id: "summary",
    title: "Summary",
    prompt: "Confirm the plan — we’ll prepare the lesson skeleton.",
  },
};

export function emptyAnswers(
  seed?: Partial<InterviewAnswers>,
): InterviewAnswers {
  return {
    topic: "",
    purpose: null,
    classProfile: null,
    duration: null,
    organization: null,
    resources: [],
    resourcesOther: "",
    projectId: "",
    subject: "",
    grade: "",
    ...seed,
  };
}

/** Deep-link into the adaptive interview. */
export function adaptiveLessonPath(options?: {
  projectId?: string;
  subject?: string;
  grade?: string;
  title?: string;
}) {
  const params = new URLSearchParams();
  if (options?.projectId) params.set("project", options.projectId);
  if (options?.subject) params.set("subject", options.subject);
  if (options?.grade) params.set("grade", options.grade);
  if (options?.title) params.set("topic", options.title);
  const q = params.toString();
  return q ? `/create/lesson?${q}` : "/create/lesson";
}
