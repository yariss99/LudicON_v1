import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAiCopilot } from "../hooks/useAiCopilot";
import { CommandPalette } from "./CommandPalette";
import "../styles/ai-copilot.css";

/**
 * Legacy host — command palette / toast only.
 * Contextual Copilot UI lives in `src/modules/copilot` (Feature 011).
 */
export function AiCopilotHost() {
  const location = useLocation();
  const { toast, clearToast } = useAiCopilot();
  const hideOnOnboarding = location.pathname.startsWith("/onboarding");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 2200);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);

  if (hideOnOnboarding) return null;

  return (
    <div className="ai-copilot-root">
      <CommandPalette />
      {toast ? (
        <div className="ac-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
