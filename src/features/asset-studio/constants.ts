import type { AssetTypeId } from "../generation-workspace/types";
import type { ExportFormat, StudioBlockKind } from "./types";

export const ASSET_STUDIO_STORAGE_KEY = "prima.asset.studio.v1";

/** Supported editing block kinds — future interactive registers here */
export const STUDIO_BLOCK_KINDS: StudioBlockKind[] = [
  "text",
  "table",
  "image",
  "icon",
  "list",
  "callout",
  "template",
  "interactive",
];

export const EXPORT_FORMATS: Array<{
  id: ExportFormat;
  label: string;
  available: boolean;
}> = [
  { id: "pdf", label: "PDF", available: true },
  { id: "docx", label: "DOCX", available: true },
  { id: "pptx", label: "PPTX", available: true },
  { id: "html", label: "HTML", available: true },
  { id: "scorm", label: "SCORM", available: false },
];

/** Logical structure templates per asset — future types append via registry */
export const STRUCTURE_TEMPLATES: Partial<
  Record<AssetTypeId, string[]>
> = {
  lesson_plan: [
    "Introduction",
    "Activity 1",
    "Activity 2",
    "Reflection",
    "Assessment",
  ],
  worksheet: ["Header", "Guided practice", "Independent practice", "Challenge"],
  assessment: ["Instructions", "Items", "Success criteria"],
  presentation: ["Hook", "Explore", "Practise", "Close"],
  educational_game: ["Brief", "Rules", "Play", "Debrief"],
  story: ["Opening", "Challenge", "Resolution"],
  rubric: ["Criteria", "Levels", "Evidence"],
  visual_resources: ["Set overview", "Classroom use"],
  observation_sheet: ["Observe", "Notes", "Reflect"],
  homework: ["Home practice", "Family tip"],
  teacher_notes: ["Setup", "Differentiation", "After class"],
};

export const ALIGNMENT_STATUS_LABEL = {
  aligned: "Aligned",
  warning: "Alignment Warning",
  conflict: "Conflict",
  unknown: "Unknown",
} as const;
