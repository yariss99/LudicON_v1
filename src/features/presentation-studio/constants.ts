import type {
  PresentationBlockType,
  PresentationSourceKind,
  PresentationStudioStatus,
} from "./types";

export const PRESENTATION_STUDIO_STATUSES: readonly {
  id: PresentationStudioStatus;
  label: string;
}[] = [
  { id: "draft", label: "Draft" },
  { id: "in_progress", label: "In Progress" },
  { id: "ready_for_review", label: "Ready for Review" },
  { id: "published", label: "Published" },
] as const;

export const PRESENTATION_ENTRY_OPTIONS: readonly {
  id: PresentationSourceKind;
  label: string;
  description: string;
}[] = [
  {
    id: "lesson",
    label: "From Lesson",
    description: "Turn lesson blocks into classroom slides.",
  },
  {
    id: "worksheet",
    label: "From Worksheet",
    description: "Visualize practice activities for the board.",
  },
  {
    id: "assessment",
    label: "From Assessment",
    description: "Walk through items and success criteria together.",
  },
  {
    id: "story",
    label: "From Story",
    description: "Bring narrative scenes onto the screen.",
  },
  {
    id: "blank",
    label: "Blank Presentation",
    description: "Start with a title slide and build freely.",
  },
] as const;

export const DEFAULT_PRESENTATION_BLOCKS: readonly PresentationBlockType[] = [
  "title",
  "text",
  "activity",
  "interactive_question",
  "reflection",
] as const;

export const PRESENTATION_BLOCK_TYPES: readonly {
  id: PresentationBlockType;
  label: string;
  category: string;
  placeholder: string;
  aiPrompt: string;
  estimatedSeconds: number;
}[] = [
  {
    id: "title",
    label: "Title",
    category: "Structure",
    placeholder: "Big idea / lesson title for this slide…",
    aiPrompt: "Would you like a clearer title slide?",
    estimatedSeconds: 30,
  },
  {
    id: "text",
    label: "Text",
    category: "Content",
    placeholder: "Key points students should see…",
    aiPrompt: "Would you like me to simplify this slide?",
    estimatedSeconds: 60,
  },
  {
    id: "image",
    label: "Image",
    category: "Media",
    placeholder: "Describe the image or visual stimulus…",
    aiPrompt: "Would you like me to suggest an illustration?",
    estimatedSeconds: 45,
  },
  {
    id: "gallery",
    label: "Gallery",
    category: "Media",
    placeholder: "List images or examples for a gallery…",
    aiPrompt: "Would you like a better gallery layout?",
    estimatedSeconds: 60,
  },
  {
    id: "table",
    label: "Table",
    category: "Structure",
    placeholder: "Rows and columns for comparison…",
    aiPrompt: "Would you like me to improve this table layout?",
    estimatedSeconds: 90,
  },
  {
    id: "diagram",
    label: "Diagram",
    category: "Visual",
    placeholder: "Describe a diagram, cycle, or concept map…",
    aiPrompt: "Would you like a clearer visual summary?",
    estimatedSeconds: 90,
  },
  {
    id: "timeline",
    label: "Timeline",
    category: "Visual",
    placeholder: "Events or steps in order…",
    aiPrompt: "Would you like me to improve this timeline?",
    estimatedSeconds: 75,
  },
  {
    id: "video",
    label: "Video",
    category: "Media",
    placeholder: "Video link or clip notes…",
    aiPrompt: "Would you like a stronger framing for this clip?",
    estimatedSeconds: 120,
  },
  {
    id: "qr_code",
    label: "QR Code",
    category: "Interactive",
    placeholder: "URL / station task behind the QR…",
    aiPrompt: "Would you like a clearer QR activity prompt?",
    estimatedSeconds: 45,
  },
  {
    id: "interactive_question",
    label: "Interactive Question",
    category: "Interactive",
    placeholder: "Question for the class to answer…",
    aiPrompt: "Would you like a better discussion question?",
    estimatedSeconds: 90,
  },
  {
    id: "brainstorm",
    label: "Brainstorm",
    category: "Interactive",
    placeholder: "Prompt for collective idea generation…",
    aiPrompt: "Would you like a richer brainstorm prompt?",
    estimatedSeconds: 120,
  },
  {
    id: "reflection",
    label: "Reflection",
    category: "Metacognition",
    placeholder: "Exit ticket or reflective prompt…",
    aiPrompt: "Would you like a clearer reflection prompt?",
    estimatedSeconds: 60,
  },
  {
    id: "activity",
    label: "Activity",
    category: "Practice",
    placeholder: "What students do next…",
    aiPrompt: "Would you like a clearer activity instruction?",
    estimatedSeconds: 180,
  },
] as const;

export const DEFAULT_AUTHOR = "Teacher";

export function presentationBlockMeta(type: PresentationBlockType) {
  return PRESENTATION_BLOCK_TYPES.find((b) => b.id === type);
}

export function presentationBlockLabel(type: PresentationBlockType): string {
  return presentationBlockMeta(type)?.label ?? type;
}

export function presentationStatusLabel(
  status: PresentationStudioStatus,
): string {
  return (
    PRESENTATION_STUDIO_STATUSES.find((s) => s.id === status)?.label ?? status
  );
}

export function presentationSourceLabel(kind: PresentationSourceKind): string {
  return (
    PRESENTATION_ENTRY_OPTIONS.find((o) => o.id === kind)?.label ?? kind
  );
}

export function estimatePresentationMinutes(
  blocks: readonly { estimatedSeconds: number }[],
): number {
  const seconds = blocks.reduce((acc, b) => acc + (b.estimatedSeconds || 0), 0);
  return Math.max(1, Math.round(seconds / 60));
}
