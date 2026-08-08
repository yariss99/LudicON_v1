import { ExperienceSelector } from "./components/ExperienceSelector";
import { OnboardingLayout } from "./components/OnboardingLayout";
import { useExperienceNavigation } from "./components/ExperienceModeSwitcher";
import { useExperienceMode } from "./hooks/useExperienceMode";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * First-run Experience Mode onboarding.
 * Route: `/onboarding/experience`
 */
export function ExperienceModePage() {
  const { choose, skip } = useExperienceNavigation();

  return (
    <OnboardingLayout onSkip={skip}>
      <ExperienceSelector onSelect={choose} />
    </OnboardingLayout>
  );
}

/** Redirects first-time teachers to Experience Mode before Dashboard. */
export function ExperienceGate({ children }: { children: ReactNode }) {
  const { needsOnboarding } = useExperienceMode();
  if (needsOnboarding) {
    return <Navigate to="/onboarding/experience" replace />;
  }
  return <>{children}</>;
}

export default ExperienceModePage;
