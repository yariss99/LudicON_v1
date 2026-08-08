import { Link, useNavigate } from "react-router-dom";
import { useExperienceMode } from "../hooks/useExperienceMode";

/** Compact header control — change experience anytime. */
export function ExperienceModeSwitcher() {
  const { preference } = useExperienceMode();
  const label =
    preference.mode === "guided"
      ? "Guided"
      : preference.mode === "advanced"
        ? "Advanced"
        : "Experience";

  return (
    <Link
      to="/onboarding/experience"
      className="shell-btn"
      style={{
        minHeight: 32,
        paddingInline: "0.7rem",
        fontSize: "0.75rem",
        textDecoration: "none",
      }}
      title="Change work experience"
    >
      {label}
    </Link>
  );
}

export function useExperienceNavigation() {
  const navigate = useNavigate();
  const { selectMode, skipOnboarding } = useExperienceMode();

  return {
    choose: (mode: "guided" | "advanced") => {
      selectMode(mode);
      navigate("/", { replace: true });
    },
    skip: () => {
      skipOnboarding();
      navigate("/", { replace: true });
    },
  };
}
