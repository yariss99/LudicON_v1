import { useLocation } from "react-router-dom";
import { FloatingCopilotButton } from "./FloatingCopilotButton";
import { SuggestionPanel } from "./SuggestionPanel";

/**
 * Global host — floating button always available; panel never auto-opens.
 */
export function CopilotHost() {
  const location = useLocation();
  if (location.pathname.startsWith("/onboarding")) return null;

  return (
    <>
      <SuggestionPanel />
      <FloatingCopilotButton />
    </>
  );
}
