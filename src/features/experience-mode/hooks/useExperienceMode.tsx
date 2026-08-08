import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { experiencePreferenceStore } from "../services/experiencePreference";
import type { ExperienceMode, ExperiencePreference } from "../types";

type ExperienceModeContextValue = {
  preference: ExperiencePreference;
  needsOnboarding: boolean;
  selectMode: (mode: ExperienceMode) => void;
  skipOnboarding: () => void;
  refresh: () => void;
};

const ExperienceModeContext =
  createContext<ExperienceModeContextValue | null>(null);

export function ExperienceModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ExperiencePreference>(() =>
    experiencePreferenceStore.get(),
  );

  const refresh = useCallback(() => {
    setPreference(experiencePreferenceStore.get());
  }, []);

  const selectMode = useCallback((mode: ExperienceMode) => {
    setPreference(experiencePreferenceStore.select(mode));
  }, []);

  const skipOnboarding = useCallback(() => {
    setPreference(experiencePreferenceStore.skip());
  }, []);

  const value = useMemo(
    () => ({
      preference,
      needsOnboarding: !preference.completed,
      selectMode,
      skipOnboarding,
      refresh,
    }),
    [preference, selectMode, skipOnboarding, refresh],
  );

  return (
    <ExperienceModeContext.Provider value={value}>
      {children}
    </ExperienceModeContext.Provider>
  );
}

export function useExperienceMode() {
  const ctx = useContext(ExperienceModeContext);
  if (!ctx) {
    throw new Error(
      "useExperienceMode must be used within ExperienceModeProvider",
    );
  }
  return ctx;
}
