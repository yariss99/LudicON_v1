import type {
  AssessmentBlockType,
  AssessmentPurpose,
  AssessmentStudioStatus,
} from "./types";

export const ASSESSMENT_STUDIO_STATUSES: readonly {
  id: AssessmentStudioStatus;
  label: string;
}[] = [
  { id: "draft", label: "Draft" },
  { id: "in_progress", label: "In Progress" },
  { id: "ready_for_review", label: "Ready for Review" },
  { id: "published", label: "Published" },
] as const;

export const ASSESSMENT_PURPOSES: readonly {
  id: AssessmentPurpose;
  label: string;
  description: string;
}[] = [
  {
    id: "initial",
    label: "Initial Assessment",
    description: "Baseline understanding before instruction.",
  },
  {
    id: "formative",
    label: "Formative Assessment",
    description: "Check learning in progress and guide next steps.",
  },
  {
    id: "summative",
    label: "Summative Assessment",
    description: "Evaluate learning at the end of a unit or cycle.",
  },
  {
    id: "self",
    label: "Self Assessment",
    description: "Students reflect on and evidence their own learning.",
  },
  {
    id: "differentiated",
    label: "Differentiated Assessment",
    description: "Multiple pathways matched to learner needs.",
  },
  {
    id: "progress_monitoring",
    label: "Progress Monitoring",
    description: "Track growth toward competencies over time.",
  },
] as const;

export const DEFAULT_ASSESSMENT_BLOCKS: readonly AssessmentBlockType[] = [
  "short_answer",
  "multiple_choice",
  "true_false",
  "problem_solving",
  "rubric",
] as const;

export const ASSESSMENT_BLOCK_TYPES: readonly {
  id: AssessmentBlockType;
  label: string;
  category: string;
  placeholder: string;
  aiPrompt: string;
  /** Minutes used when estimating duration. */
  durationWeight: number;
}[] = [
  {
    id: "short_answer",
    label: "Short Answer",
    category: "Constructed",
    placeholder: "Prompt that invites a concise written response…",
    aiPrompt: "Would you like me to clarify this short-answer prompt?",
    durationWeight: 3,
  },
  {
    id: "multiple_choice",
    label: "Multiple Choice",
    category: "Selected",
    placeholder: "Stem + options A–D. Mark the intended answer…",
    aiPrompt: "Would you like me to improve the stem and distractors?",
    durationWeight: 2,
  },
  {
    id: "true_false",
    label: "True / False",
    category: "Selected",
    placeholder: "Statement to judge true or false, with a brief justification…",
    aiPrompt: "Would you like me to refine this true/false item?",
    durationWeight: 1,
  },
  {
    id: "matching",
    label: "Matching",
    category: "Selected",
    placeholder: "Pairs to match — concepts, examples, definitions…",
    aiPrompt: "Would you like me to draft a matching set?",
    durationWeight: 4,
  },
  {
    id: "ordering",
    label: "Ordering",
    category: "Selected",
    placeholder: "Steps or events students put in the correct order…",
    aiPrompt: "Would you like me to suggest an ordering sequence?",
    durationWeight: 3,
  },
  {
    id: "fill_blank",
    label: "Fill in the Blank",
    category: "Constructed",
    placeholder: "Sentence or paragraph with blanks for key terms…",
    aiPrompt: "Would you like me to craft fill-in-the-blank items?",
    durationWeight: 2,
  },
  {
    id: "problem_solving",
    label: "Problem Solving",
    category: "Performance",
    placeholder: "Multi-step problem that surfaces reasoning…",
    aiPrompt: "Would you like me to strengthen this problem-solving task?",
    durationWeight: 8,
  },
  {
    id: "essay",
    label: "Essay",
    category: "Constructed",
    placeholder: "Extended writing prompt with success criteria…",
    aiPrompt: "Would you like me to improve this essay prompt?",
    durationWeight: 15,
  },
  {
    id: "practical_task",
    label: "Practical Task",
    category: "Performance",
    placeholder: "Hands-on or applied task students perform…",
    aiPrompt: "Would you like me to design a clearer practical task?",
    durationWeight: 12,
  },
  {
    id: "observation",
    label: "Observation",
    category: "Evidence",
    placeholder: "Observable behaviors / criteria the teacher notes…",
    aiPrompt: "Would you like me to draft observation look-fors?",
    durationWeight: 5,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    category: "Evidence",
    placeholder: "Artifacts students collect to evidence growth…",
    aiPrompt: "Would you like me to suggest portfolio evidence items?",
    durationWeight: 10,
  },
  {
    id: "self_assessment",
    label: "Self Assessment",
    category: "Metacognition",
    placeholder: "Checklist or reflection students complete about their learning…",
    aiPrompt: "Would you like me to create a self-assessment checklist?",
    durationWeight: 5,
  },
  {
    id: "rubric",
    label: "Rubric",
    category: "Criteria",
    placeholder: "Levels and criteria for scoring performance…",
    aiPrompt: "Would you like me to draft a simple rubric?",
    durationWeight: 4,
  },
] as const;

export const DEFAULT_AUTHOR = "Teacher";

export function assessmentBlockMeta(type: AssessmentBlockType) {
  return ASSESSMENT_BLOCK_TYPES.find((b) => b.id === type);
}

export function assessmentBlockLabel(type: AssessmentBlockType): string {
  return assessmentBlockMeta(type)?.label ?? type;
}

export function assessmentPurposeLabel(purpose: AssessmentPurpose): string {
  return ASSESSMENT_PURPOSES.find((p) => p.id === purpose)?.label ?? purpose;
}

export function assessmentStatusLabel(status: AssessmentStudioStatus): string {
  return ASSESSMENT_STUDIO_STATUSES.find((s) => s.id === status)?.label ?? status;
}

export function estimateDurationMinutes(
  blocks: readonly { type: AssessmentBlockType }[],
  fallback = 20,
): number {
  const sum = blocks.reduce((acc, b) => {
    return acc + (assessmentBlockMeta(b.type)?.durationWeight ?? 3);
  }, 0);
  return Math.max(fallback, sum || fallback);
}
