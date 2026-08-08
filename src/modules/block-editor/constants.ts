import type { BlockDefinition, UniversalBlockType } from "./types";

export const DEFAULT_BLOCK_TYPES: readonly UniversalBlockType[] = [
  "text",
  "image",
  "video",
  "table",
  "exercise",
  "question",
  "brainstorm",
  "reflection",
  "attachment",
] as const;

export const CORE_BLOCK_DEFINITIONS: readonly BlockDefinition[] = [
  {
    type: "text",
    label: "Text",
    description: "Paragraph or rich teaching notes",
    placeholder: "Write content…",
    icon: "T",
  },
  {
    type: "image",
    label: "Image",
    description: "Image URL or description",
    placeholder: "Describe the image or paste a URL…",
    icon: "🖼",
  },
  {
    type: "video",
    label: "Video",
    description: "Video link or embed notes",
    placeholder: "Paste a video URL or describe the clip…",
    icon: "▶",
  },
  {
    type: "table",
    label: "Table",
    description: "Tabular structure for students",
    placeholder: "Describe rows and columns…",
    icon: "▦",
  },
  {
    type: "exercise",
    label: "Exercise",
    description: "Practice task",
    placeholder: "Describe the exercise prompt…",
    icon: "✎",
  },
  {
    type: "question",
    label: "Question",
    description: "Check for understanding",
    placeholder: "Write the question…",
    icon: "?",
  },
  {
    type: "brainstorm",
    label: "Brainstorm",
    description: "Ideation prompt",
    placeholder: "What should students brainstorm?",
    icon: "✦",
  },
  {
    type: "reflection",
    label: "Reflection",
    description: "Metacognitive close",
    placeholder: "Prompt student reflection…",
    icon: "◎",
  },
  {
    type: "attachment",
    label: "Attachment",
    description: "File or resource reference",
    placeholder: "Name the attachment or link…",
    icon: "📎",
  },
] as const;

export const BLOCK_EDITOR_STORAGE_KEY = "prima.block-editor.documents.v1";
