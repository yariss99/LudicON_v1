/**
 * PS-002 — Memory Engine types.
 * Teacher-owned personalization memory — never replaces teacher decisions.
 */

export type MemoryDomain =
  | 'teacher_profile'
  | 'teaching_preferences'
  | 'class_profiles'
  | 'school_context'
  | 'pedagogical_preferences'
  | 'generated_assets'
  | 'blueprint_history'
  | 'resource_usage'
  | 'interaction_patterns'
  | 'custom_templates';

export type MemoryTier = 'working' | 'long_term';

export type MemoryItemStatus = 'active' | 'archived' | 'deleted';

export type MemorySourceKind =
  | 'teacher_explicit'
  | 'teacher_correction'
  | 'session_distilled'
  | 'system_observed';

export type MemorySource = {
  kind: MemorySourceKind;
  label: string;
  sessionId?: string;
};

/** Every stored item must include source, confidence, lastUpdated, usageCount */
export type MemoryItem<TPayload = Record<string, unknown>> = {
  id: string;
  teacherId: string;
  domain: MemoryDomain;
  tier: MemoryTier;
  title: string;
  payload: TPayload;
  source: MemorySource;
  /** 0–1; never invent high confidence without evidence */
  confidence: number;
  lastUpdated: string;
  usageCount: number;
  status: MemoryItemStatus;
  createdAt: string;
  /** Deduplication key (e.g. blueprint similarity) */
  canonicalKey?: string;
  /** Audit trail of updates */
  updateLog: MemoryUpdateRecord[];
};

export type MemoryUpdateRecord = {
  at: string;
  action: 'create' | 'update' | 'correct' | 'use' | 'archive' | 'delete' | 'restore';
  source: MemorySource;
  note?: string;
};

export type TeacherProfilePayload = {
  preferredLanguage?: string;
  preferredTone?: string;
  teachingStyle?: string;
  experienceLevel?: string;
  preferredDigitalTools?: string[];
  accessibilityPreferences?: string[];
};

export type ClassProfilePayload = {
  classId: string;
  grade: string;
  className: string;
  numberOfStudents?: number;
  learningPace?: string;
  strengths?: string[];
  challenges?: string[];
  specialNotes?: string;
  differentiationNeeds?: string[];
};

export type PedagogicalPreferencesPayload = {
  instructionalModels?: string[];
  assessmentPreferences?: string[];
  lessonDurationMinutes?: number;
  favoriteActivityTypes?: string[];
  preferredDigitalPlatforms?: string[];
  differentiationHabits?: string[];
  feedbackStyle?: string;
};

export type BlueprintMemoryPayload = {
  blueprintId: string;
  topic: string;
  subject: string;
  grade: string;
  competencies?: string[];
  objectives?: string[];
  teachingStrategy?: string;
  generatedAssetIds?: string[];
  teacherFeedback?: string;
  approvedAt: string;
};

export type ResourceMemoryPayload = {
  resourceId: string;
  kind:
    | 'worksheet'
    | 'template'
    | 'presentation'
    | 'game'
    | 'story'
    | 'assessment'
    | 'visual'
    | 'other';
  title: string;
  subject?: string;
  grade?: string;
  topic?: string;
  lastUsedAt: string;
};

export type CustomTemplatePayload = {
  templateId: string;
  title: string;
  subject?: string;
  grade?: string;
  structureHint?: string;
};

export type SchoolContextPayload = {
  schoolName?: string;
  locale?: string;
  scheduleNotes?: string;
};

export type InteractionPatternPayload = {
  pattern: string;
  evidence: string;
  occurrences: number;
};

export type WorkingMemoryState = {
  sessionId: string;
  teacherId: string;
  currentBlueprintId?: string;
  conversationState?: Record<string, unknown>;
  openAssetIds: string[];
  recentDecisions: Array<{ id: string; summary: string; at: string }>;
  unsavedChanges: boolean;
  startedAt: string;
  updatedAt: string;
};

export type PersonalizationSuggestion = {
  id: string;
  message: string;
  basedOnItemIds: string[];
  optional: true;
  teacherDecides: true;
};

export type ExperienceRetrievalRequest = {
  teacherId: string;
  classId?: string;
  grade?: string;
  subject?: string;
  topic?: string;
  limit?: number;
};

export type ExperienceRetrievalResult = {
  classProfile?: MemoryItem<ClassProfilePayload>;
  teachingPreferences: MemoryItem[];
  pedagogicalPreferences: MemoryItem[];
  similarBlueprints: MemoryItem<BlueprintMemoryPayload>[];
  frequentlyUsedResources: MemoryItem<ResourceMemoryPayload>[];
  personalTemplates: MemoryItem<CustomTemplatePayload>[];
  knownStableFields: string[];
  suggestions: PersonalizationSuggestion[];
};

export type MemorySearchRequest = {
  teacherId: string;
  text: string;
  domain?: MemoryDomain;
  tier?: MemoryTier;
  limit?: number;
};

export type MemorySearchHit = {
  item: MemoryItem;
  score: number;
  explanation: string;
};

export type ForgetScope =
  | { type: 'item'; itemId: string }
  | { type: 'class'; teacherId: string; classId: string }
  | { type: 'preference'; teacherId: string; preferenceKey?: string }
  | { type: 'blueprint'; teacherId: string; blueprintId: string }
  | { type: 'everything'; teacherId: string };

export const ALL_MEMORY_DOMAINS: MemoryDomain[] = [
  'teacher_profile',
  'teaching_preferences',
  'class_profiles',
  'school_context',
  'pedagogical_preferences',
  'generated_assets',
  'blueprint_history',
  'resource_usage',
  'interaction_patterns',
  'custom_templates',
];

export const STABLE_PROFILE_FIELDS = [
  'preferredLanguage',
  'preferredTone',
  'teachingStyle',
  'experienceLevel',
  'preferredDigitalTools',
  'accessibilityPreferences',
] as const;

export type StableProfileField = (typeof STABLE_PROFILE_FIELDS)[number];
