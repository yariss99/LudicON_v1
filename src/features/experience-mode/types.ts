export type ExperienceMode = "guided" | "advanced";

export type ExperiencePreference = {
  mode: ExperienceMode | null;
  /** True once onboarding was completed or skipped */
  completed: boolean;
  updatedAt: string;
};

export type ExperienceFeatureRow = {
  feature: string;
  guided: boolean;
  advanced: boolean;
};

export type ExperienceCardData = {
  id: ExperienceMode;
  emoji: string;
  title: string;
  description: string;
  features: readonly string[];
  cta: string;
};
