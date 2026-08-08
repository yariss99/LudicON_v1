/**
 * Resource Studio — central educational asset library.
 */

export type ResourceStudioType =
  | "document"
  | "image"
  | "worksheet"
  | "lesson"
  | "assessment"
  | "presentation"
  | "game"
  | "story"
  | "video"
  | "audio"
  | "link"
  | "zip"
  | "other";

export type ResourceStudioSection =
  | "all"
  | "documents"
  | "images"
  | "worksheets"
  | "lessons"
  | "assessments"
  | "presentations"
  | "games"
  | "videos"
  | "audio"
  | "favorites"
  | "recent";

export type ResourceImportFormat =
  | "word"
  | "pdf"
  | "powerpoint"
  | "image"
  | "zip"
  | "google_drive"
  | "onedrive"
  | "external_link";

export type ResourceSourceKind = "studio" | "import" | "link" | "manual";

export type ResourceStudioItem = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  projectId: string;
  projectTitle: string;
  type: ResourceStudioType;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  tags: string[];
  favorite: boolean;
  usageCount: number;
  /** Artifact / studio IDs this resource is reused across. */
  linkedTo: string[];
  sourceHref?: string;
  sourceKind: ResourceSourceKind;
  importFormat?: ResourceImportFormat;
  description: string;
  contentPreview: string;
};

export type ResourceViewMode = "grid" | "list";

export type ResourceSortOption =
  | "updated"
  | "created"
  | "alpha"
  | "usage"
  | "recent";

export type ResourceStudioFilters = {
  query: string;
  type: ResourceStudioType | "";
  subject: string;
  grade: string;
  tag: string;
  favoritesOnly: boolean;
};
