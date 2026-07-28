import type { TeachingInsight } from "../types";
import ActionBar from "./ActionBar";
import ExplanationDrawer from "./ExplanationDrawer";
import ImpactBadge from "./ImpactBadge";
import InsightBadge from "./InsightBadge";

type InsightCardProps = {
  insight: TeachingInsight;
  whyOpen: boolean;
  onReview: () => void;
  onLearnWhy: () => void;
  onDismiss: () => void;
};

function InsightCard({
  insight,
  whyOpen,
  onReview,
  onLearnWhy,
  onDismiss,
}: InsightCardProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <InsightBadge category={insight.category} />
        <ImpactBadge label={insight.impactLabel} />
      </div>

      <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
        {insight.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
        {insight.explanation}
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Why it matters
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {insight.whyItMatters}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Expected impact
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            {insight.expectedImpact}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Suggested action
          </p>
          <p className="mt-1.5 text-sm font-medium text-slate-800">
            {insight.suggestedAction}
          </p>
        </div>
      </div>

      <ExplanationDrawer
        open={whyOpen}
        whyItMatters={insight.whyItMatters}
        expectedImpact={insight.expectedImpact}
      />

      <div className="mt-auto pt-8">
        <ActionBar
          whyOpen={whyOpen}
          reviewLabel="Review"
          onReview={onReview}
          onLearnWhy={onLearnWhy}
          onDismiss={onDismiss}
        />
      </div>
    </div>
  );
}

export default InsightCard;
