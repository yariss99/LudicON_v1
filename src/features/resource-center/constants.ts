import type {
  ResourceAiActionId,
  ResourceAssetType,
  ResourceSectionId,
  ResourceShareScope,
} from "./types";

export const ASSET_TYPES: readonly {
  id: ResourceAssetType;
  label: string;
}[] = [
  { id: "lesson", label: "Lecții" },
  { id: "worksheet", label: "Fișe" },
  { id: "assessment", label: "Evaluări" },
  { id: "story", label: "Povești" },
  { id: "game", label: "Jocuri" },
  { id: "presentation", label: "Prezentări" },
  { id: "image", label: "Imagini" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "pdf", label: "PDF" },
  { id: "office", label: "Documente Office" },
  { id: "template", label: "Șabloane" },
  { id: "ai_generated", label: "Generate AI" },
  { id: "teacher_upload", label: "Încărcate" },
  { id: "school_shared", label: "Partajate școală" },
] as const;

export const ASSET_TYPE_LABEL: Record<ResourceAssetType, string> =
  Object.fromEntries(ASSET_TYPES.map((a) => [a.id, a.label])) as Record<
    ResourceAssetType,
    string
  >;

export const SHARE_SCOPES: readonly {
  id: ResourceShareScope;
  label: string;
}[] = [
  { id: "personal", label: "Bibliotecă personală" },
  { id: "team", label: "Workspace echipă" },
  { id: "school", label: "Bibliotecă școală" },
  { id: "district", label: "Bibliotecă district" },
  { id: "public", label: "Bibliotecă publică" },
] as const;

export const RESOURCE_SECTIONS: readonly {
  id: ResourceSectionId;
  label: string;
}[] = [
  { id: "browse", label: "Browse" },
  { id: "search", label: "Căutare avansată" },
  { id: "graph", label: "Knowledge Graph" },
  { id: "detail", label: "Asset Viewer" },
  { id: "metadata", label: "Metadate" },
  { id: "sharing", label: "Partajare" },
  { id: "versions", label: "Versiuni" },
  { id: "analytics", label: "Analytics" },
  { id: "ai", label: "AI Knowledge" },
  { id: "coverage", label: "Acoperire curriculară" },
] as const;

export const AI_ACTIONS: readonly {
  id: ResourceAiActionId;
  label: string;
  description: string;
}[] = [
  {
    id: "suggest_existing",
    label: "Sugerează resurse existente",
    description: "Recomandă asset-uri din bibliotecă pentru contextul curent.",
  },
  {
    id: "recommend_similar",
    label: "Resurse similare",
    description: "Găsește asset-uri asemănătoare semantic.",
  },
  {
    id: "detect_missing",
    label: "Detectează lipsuri",
    description: "Identifică tipuri de resurse absente în proiect.",
  },
  {
    id: "suggest_reuse",
    label: "Oportunități de reutilizare",
    description: "Propune reuse în loc de creare de la zero.",
  },
  {
    id: "merge_similar",
    label: "Unește similare",
    description: "Marchează duplicate / clustere pentru merge.",
  },
  {
    id: "recommend_improvements",
    label: "Îmbunătățiri",
    description: "Sugestii de metadate, tag-uri, obiective.",
  },
  {
    id: "generate_metadata",
    label: "Generează metadate",
    description: "Completează descriere, tag-uri, competențe.",
  },
  {
    id: "auto_summarize",
    label: "Rezumă",
    description: "Rezumat AI al resurselor selectate / indexate.",
  },
  {
    id: "extract_keywords",
    label: "Extrage cuvinte cheie",
    description: "Keywords pentru index semantic.",
  },
  {
    id: "identify_curriculum_coverage",
    label: "Acoperire curriculară",
    description: "Hartă curriculum pe resurse.",
  },
] as const;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const AUTOSAVE_DELAY_MS = 700;
