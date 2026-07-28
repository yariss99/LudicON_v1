import ActionCard from "../components/ActionCard";
import EmptyInsight from "../components/EmptyInsight";
import InsightCard from "../components/InsightCard";
import InsightLoadingState from "../components/InsightLoadingState";
import { INSIGHT_SUBTITLE, INSIGHT_TITLE } from "../constants";
import { useTeachingInsight } from "../hooks";

type TeachingInsightSectionProps = {
  experienceId?: string | null;
  onReview: () => void;
};

function TeachingInsightSection({
  experienceId,
  onReview,
}: TeachingInsightSectionProps) {
  const insightState = useTeachingInsight(experienceId);

  const handleReview = () => {
    insightState.accept();
    onReview();
  };

  return (
    <section
      id="teaching-insight"
      className="flex h-full scroll-mt-8 flex-col"
      aria-labelledby="teaching-insight-heading"
    >
      <ActionCard
        emphasized
        className="flex h-full min-h-[28rem] flex-col transition-all duration-300"
      >
        <header className="mb-8">
          <h2
            id="teaching-insight-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            {INSIGHT_TITLE}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{INSIGHT_SUBTITLE}</p>
        </header>

        {insightState.state === "loading" ? <InsightLoadingState /> : null}

        {insightState.state === "available" && insightState.insight ? (
          <InsightCard
            insight={insightState.insight}
            whyOpen={insightState.whyOpen}
            onReview={handleReview}
            onLearnWhy={insightState.toggleWhy}
            onDismiss={insightState.dismiss}
          />
        ) : null}

        {insightState.state === "none" ? (
          <EmptyInsight variant="none" />
        ) : null}

        {insightState.state === "accepted" ? (
          <EmptyInsight variant="accepted" />
        ) : null}

        {insightState.state === "dismissed" ? (
          <EmptyInsight variant="dismissed" />
        ) : null}
      </ActionCard>
    </section>
  );
}

export default TeachingInsightSection;
