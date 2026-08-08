import type {
  ResourceImportFormat,
  ResourceStudioSection,
  ResourceStudioType,
} from "./types";

export const RESOURCE_SECTIONS: readonly {
  id: ResourceStudioSection;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "documents", label: "Documents" },
  { id: "images", label: "Images" },
  { id: "worksheets", label: "Worksheets" },
  { id: "lessons", label: "Lessons" },
  { id: "assessments", label: "Assessments" },
  { id: "presentations", label: "Presentations" },
  { id: "games", label: "Games" },
  { id: "videos", label: "Videos" },
  { id: "audio", label: "Audio" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recent" },
] as const;

export const RESOURCE_TYPES: readonly {
  id: ResourceStudioType;
  label: string;
  section: ResourceStudioSection;
}[] = [
  { id: "document", label: "Document", section: "documents" },
  { id: "image", label: "Image", section: "images" },
  { id: "worksheet", label: "Worksheet", section: "worksheets" },
  { id: "lesson", label: "Lesson", section: "lessons" },
  { id: "assessment", label: "Assessment", section: "assessments" },
  { id: "presentation", label: "Presentation", section: "presentations" },
  { id: "game", label: "Game", section: "games" },
  { id: "story", label: "Story", section: "documents" },
  { id: "video", label: "Video", section: "videos" },
  { id: "audio", label: "Audio", section: "audio" },
  { id: "link", label: "Link", section: "documents" },
  { id: "zip", label: "ZIP archive", section: "documents" },
  { id: "other", label: "Other", section: "documents" },
] as const;

export const IMPORT_OPTIONS: readonly {
  id: ResourceImportFormat;
  label: string;
  description: string;
  mapsTo: ResourceStudioType;
}[] = [
  {
    id: "word",
    label: "Word",
    description: "Import a .docx document (placeholder).",
    mapsTo: "document",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Import a PDF handout (placeholder).",
    mapsTo: "document",
  },
  {
    id: "powerpoint",
    label: "PowerPoint",
    description: "Import slides (placeholder).",
    mapsTo: "presentation",
  },
  {
    id: "image",
    label: "Images",
    description: "Import PNG / JPG / SVG (placeholder).",
    mapsTo: "image",
  },
  {
    id: "zip",
    label: "ZIP",
    description: "Import a packed resource bundle (placeholder).",
    mapsTo: "zip",
  },
  {
    id: "google_drive",
    label: "Google Drive",
    description: "Connect Drive and pick a file (placeholder).",
    mapsTo: "link",
  },
  {
    id: "onedrive",
    label: "OneDrive",
    description: "Connect OneDrive and pick a file (placeholder).",
    mapsTo: "link",
  },
  {
    id: "external_link",
    label: "External Link",
    description: "Save a URL as a reusable resource.",
    mapsTo: "link",
  },
] as const;

export const DEFAULT_AUTHOR = "Teacher";

export function resourceTypeLabel(type: ResourceStudioType): string {
  return RESOURCE_TYPES.find((t) => t.id === type)?.label ?? type;
}

export function sectionTypes(section: ResourceStudioSection): ResourceStudioType[] | null {
  if (section === "all" || section === "favorites" || section === "recent") {
    return null;
  }
  return RESOURCE_TYPES.filter((t) => t.section === section).map((t) => t.id);
}
