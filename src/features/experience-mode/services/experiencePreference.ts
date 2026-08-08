import { nowIso } from "../../../utils/date";
import { EXPERIENCE_STORAGE_KEY } from "../constants";
import type { ExperienceMode, ExperiencePreference } from "../types";

const defaultPreference: ExperiencePreference = {
  mode: null,
  completed: false,
  updatedAt: "",
};

function read(): ExperiencePreference {
  try {
    const raw = localStorage.getItem(EXPERIENCE_STORAGE_KEY);
    if (!raw) return { ...defaultPreference };
    const parsed = JSON.parse(raw) as Partial<ExperiencePreference>;
    return {
      mode:
        parsed.mode === "guided" || parsed.mode === "advanced"
          ? parsed.mode
          : null,
      completed: Boolean(parsed.completed),
      updatedAt: parsed.updatedAt || "",
    };
  } catch {
    return { ...defaultPreference };
  }
}

function write(preference: ExperiencePreference) {
  localStorage.setItem(EXPERIENCE_STORAGE_KEY, JSON.stringify(preference));
}

export const experiencePreferenceStore = {
  get(): ExperiencePreference {
    return read();
  },

  needsOnboarding(): boolean {
    return !read().completed;
  },

  select(mode: ExperienceMode): ExperiencePreference {
    const next: ExperiencePreference = {
      mode,
      completed: true,
      updatedAt: nowIso(),
    };
    write(next);
    return next;
  },

  skip(): ExperiencePreference {
    const current = read();
    const next: ExperiencePreference = {
      mode: current.mode,
      completed: true,
      updatedAt: nowIso(),
    };
    write(next);
    return next;
  },

  clear(): void {
    localStorage.removeItem(EXPERIENCE_STORAGE_KEY);
  },
};
