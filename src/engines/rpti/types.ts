/** FEATURE-006 — RPTI runtime types */

export type ReflectionMode =
  | "quick"
  | "guided"
  | "evidence"
  | "comprehensive"
  | "voice";

export type ReflectionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "archived";

export type InsightKind =
  | "timing"
  | "engagement"
  | "assessment"
  | "differentiation"
  | "resources"
  | "strategy"
  | "objectives"
  | "habit";

export type ShareDecision = "private" | "export" | "share_selected";

export type ReflectionPrompt = {
  id: string;
  mode: ReflectionMode | "all";
  questionRo: string;
  pedagogicalFocus: InsightKind;
};

export type ReflectionAnswer = {
  promptId: string;
  value: string;
  rating?: number;
};

export type ReflectionRecord = {
  id: string;
  schemaVersion: string;
  lessonProjectId: string;
  lessonTitle: string;
  publicationId?: string;
  mode: ReflectionMode;
  status: ReflectionStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  answers: ReflectionAnswer[];
  strengths: string[];
  improvements: string[];
  personalNotes: string;
  followUpActions: string[];
  shareDecision: ShareDecision;
  private: true;
};

export type PedagogicalInsight = {
  id: string;
  kind: InsightKind;
  title: string;
  observation: string;
  pedagogicalExplanation: string;
  evidenceCount: number;
  confidence: "low" | "medium" | "high";
};

export type ImprovementRecommendation = {
  id: string;
  insightId: string;
  observation: string;
  pedagogicalExplanation: string;
  suggestedImprovement: string;
  expectedImpact: string;
  relatedResourceHints: string[];
  applyToFutureLesson?: {
    focusSection: string;
    note: string;
  };
};

export type GrowthProfile = {
  teacherId: string;
  updatedAt: string;
  strategiesUsed: string[];
  assessmentMethods: string[];
  differentiationFrequency: number;
  digitalIntegrationFrequency: number;
  reflectionCount: number;
  completedLessonCount: number;
  professionalGoals: string[];
  averageSelfRatedEngagement?: number;
  evaluationForbidden: true;
};

export type PortfolioEntry = {
  id: string;
  kind:
    | "lesson_design"
    | "published_package"
    | "reflection_note"
    | "teaching_evidence"
    | "pd_goal"
    | "certificate"
    | "innovation_project"
    | "inspection_evidence";
  title: string;
  createdAt: string;
  lessonProjectId?: string;
  reflectionId?: string;
  publicationId?: string;
  notes: string;
  editable: true;
  shareDecision: ShareDecision;
};

export type AchievementMilestone = {
  id: string;
  titleRo: string;
  descriptionRo: string;
  achievedAt?: string;
  celebrated: boolean;
};

export type LessonComparisonView = {
  leftLessonId: string;
  rightLessonId: string;
  dimensions: Array<{
    id: string;
    labelRo: string;
    leftSummary: string;
    rightSummary: string;
  }>;
};

export type PersonalAnalyticsSnapshot = {
  averageLessonDuration?: number;
  strategyDiversity: number;
  assessmentBalance: number;
  reflectionFrequency: number;
  resourceReuse: number;
  monthlyReflectionCounts: number[];
};
