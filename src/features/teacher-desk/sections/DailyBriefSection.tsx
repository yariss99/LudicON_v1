import DailyBriefCard from "../components/DailyBriefCard";
import type { DailyBriefView } from "../types";

type DailyBriefSectionProps = {
  brief: DailyBriefView;
  onContinue: (projectId: string) => void;
  onCreate: () => void;
};

function DailyBriefSection({
  brief,
  onContinue,
  onCreate,
}: DailyBriefSectionProps) {
  const handlePrimary = () => {
    if (brief.primaryAction === "continue" && brief.focusExperienceId) {
      onContinue(brief.focusExperienceId);
      return;
    }
    onCreate();
  };

  return (
    <section aria-labelledby="daily-brief-heading">
      <h2 id="daily-brief-heading" className="sr-only">
        Daily Brief
      </h2>
      <DailyBriefCard brief={brief} onPrimary={handlePrimary} />
    </section>
  );
}

export default DailyBriefSection;
