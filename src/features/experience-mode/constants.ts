import type { ExperienceCardData, ExperienceFeatureRow } from "./types";

export const EXPERIENCE_STORAGE_KEY = "prima.experience-mode.v1";

export const EXPERIENCE_CARDS: readonly ExperienceCardData[] = [
  {
    id: "guided",
    emoji: "🌱",
    title: "Guided Experience",
    description:
      "Ideal if you prefer a simple, guided workflow.",
    features: [
      "Step-by-step guidance",
      "Automatic educational suggestions",
      "Minimal configuration",
      "Focus on teaching",
    ],
    cta: "Start in Guided Mode",
  },
  {
    id: "advanced",
    emoji: "🚀",
    title: "Advanced Experience",
    description:
      "Ideal if you prefer full control over every educational resource.",
    features: [
      "Advanced educational settings",
      "Prompt customization",
      "Complete control",
      "Professional workflow",
    ],
    cta: "Start in Advanced Mode",
  },
] as const;

export const EXPERIENCE_COMPARISON: readonly ExperienceFeatureRow[] = [
  {
    feature: "Step-by-step assistant",
    guided: true,
    advanced: true,
  },
  {
    feature: "Automatic AI suggestions",
    guided: true,
    advanced: true,
  },
  {
    feature: "Curriculum automation",
    guided: true,
    advanced: true,
  },
  {
    feature: "Prompt editing",
    guided: false,
    advanced: true,
  },
  {
    feature: "Advanced settings",
    guided: false,
    advanced: true,
  },
  {
    feature: "Complete customization",
    guided: false,
    advanced: true,
  },
] as const;
