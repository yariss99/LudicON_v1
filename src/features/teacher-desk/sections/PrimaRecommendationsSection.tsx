import { useMemo, useState } from "react";
import AtelierSectionHeader from "../components/AtelierSectionHeader";
import RecommendationCard from "../components/RecommendationCard";
import {
  dismissInsightForToday,
  isInsightDismissedForToday,
  TEACHING_INSIGHTS,
} from "../services";
import type { TeachingInsight } from "../types";

type PrimaRecommendationsSectionProps = {
  onAction: () => void;
};

function PrimaRecommendationsSection({
  onAction,
}: PrimaRecommendationsSectionProps) {
  const [tick, setTick] = useState(0);

  const recommendations = useMemo(() => {
    void tick;
    return TEACHING_INSIGHTS.filter(
      (insight) => !isInsightDismissedForToday(insight.id),
    ).slice(0, 3);
  }, [tick]);

  const primary = recommendations[0] ?? null;
  const secondary = recommendations.slice(1, 3);

  const handleDismiss = (insight: TeachingInsight) => {
    dismissInsightForToday(insight.id);
    setTick((value) => value + 1);
  };

  return (
    <section
      id="recomandari-prima"
      className="atelier-section scroll-mt-10"
      aria-labelledby="prima-recommendations-heading"
    >
      <AtelierSectionHeader
        id="prima-recommendations-heading"
        title="PRIMA recomandă"
        description={
          primary
            ? "Sugestii concentrate pe impactul din clasă."
            : "Astăzi ești la zi — nu ai recomandări în așteptare."
        }
      />

      {primary ? (
        <div className="atelier-recs-layout">
          <RecommendationCard
            insight={primary}
            primary
            onAction={onAction}
            onDismiss={() => handleDismiss(primary)}
          />

          {secondary.length > 0 ? (
            <div className="atelier-recs-secondary">
              {secondary.map((insight) => (
                <RecommendationCard
                  key={insight.id}
                  insight={insight}
                  onAction={onAction}
                  onDismiss={() => handleDismiss(insight)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default PrimaRecommendationsSection;
