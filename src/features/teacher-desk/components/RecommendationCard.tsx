import { Sparkles } from "lucide-react";
import { PrimaButton } from "../../../design-system";
import type { TeachingInsight } from "../types";

type RecommendationCardProps = {
  insight: TeachingInsight;
  primary?: boolean;
  onAction: () => void;
  onDismiss?: () => void;
};

function RecommendationCard({
  insight,
  primary = false,
  onAction,
  onDismiss,
}: RecommendationCardProps) {
  return (
    <article
      className={[
        "atelier-card atelier-card--lift",
        primary ? "atelier-card--primary-rec" : "",
      ].join(" ")}
    >
      <div className="atelier-card-stack">
        <div className="flex items-start gap-3">
          <span
            className={[
              "atelier-icon-well atelier-icon-well--amber",
              primary ? "" : "atelier-icon-well--sm",
            ].join(" ")}
          >
            <Sparkles
              size={primary ? 22 : 18}
              strokeWidth={1.55}
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <p className="atelier-label text-[var(--prima-accent)]">
              {insight.category}
            </p>
            <h3 className="atelier-card-title atelier-line-clamp-2 mt-1">
              {insight.title}
            </h3>
          </div>
        </div>

        <p
          className={[
            "atelier-body atelier-card-gap-md",
            primary ? "atelier-line-clamp-3" : "atelier-line-clamp-2",
          ].join(" ")}
        >
          {insight.explanation}
        </p>

        <p className="atelier-caption atelier-card-gap-sm font-medium text-[var(--atelier-ink)]">
          Valoare educațională: {insight.expectedImpact}
        </p>
      </div>

      <div className="atelier-card-foot">
        <div className="flex flex-wrap items-center gap-2">
          <PrimaButton
            variant="primary"
            className="min-h-11"
            onClick={onAction}
          >
            {insight.suggestedAction}
          </PrimaButton>
          {onDismiss ? (
            <PrimaButton
              variant="ghost"
              className="min-h-11"
              onClick={onDismiss}
            >
              Nu acum
            </PrimaButton>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default RecommendationCard;
