export type WizardResourceType =
  | "lesson"
  | "worksheet"
  | "assessment"
  | "presentation"
  | "game"
  | "story";

export type WizardSourceKind =
  | "blank"
  | "lesson"
  | "worksheet"
  | "assessment"
  | "game"
  | "story";

export type WizardStep = 1 | 2 | 3 | 4;

export type SourceOption = {
  id: string;
  title: string;
  meta?: string;
};

export type WizardDraft = {
  resourceType: WizardResourceType | null;
  sourceKind: WizardSourceKind | null;
  sourceId: string | null;
  title: string;
  projectId: string;
  subject: string;
  grade: string;
};

export type CreateResourceResult = {
  resourceType: WizardResourceType;
  projectId: string;
  resourceId: string;
  title: string;
  href: string;
};
