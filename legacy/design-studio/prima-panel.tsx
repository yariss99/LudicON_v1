import {
  DESIGN_SCORE_LABEL,
  LESSON_SECTION_LABEL,
  totalPlannedMinutes,
  type LessonPlan,
} from "@ludicon/domain";
import {
  DesignScoreMeter,
  FloatingSuggestion,
  PrimaMark,
  type DesignScoreDimension,
} from "@ludicon/ui";

import { designScore, sectionsStillNeeded } from "./lesson-analysis";
import type { Recommendation } from "./recommendations";

/**
 * Why a dimension reads thin, in one sentence.
 *
 * The meter refuses to show a low number without an explanation, so the
 * explanation is supplied here rather than left to a default — a generic line
 * beside a specific number is how a support metric starts feeling like a mark.
 */
const DIMENSION_NOTE: Readonly<
  Record<keyof typeof DESIGN_SCORE_LABEL, string>
> = Object.freeze({
  overall: "",
  curriculum:
    "Puține momente sunt legate de o competență. Adaugă una acolo unde se potrivește firesc.",
  activities: "Lecția are încă puține momente în care copiii lucrează efectiv.",
  assessment: "Nu se vede încă din ce anume vei ști că au învățat.",
  differentiation:
    "Momentele nu spun încă cum se desfășoară, așa că e greu de adaptat pentru toți copiii.",
  timeBalance:
    "Minutele momentelor nu se potrivesc cu durata lecției. Poți reașeza oricând.",
  accessibility:
    "Puține momente au resurse trecute, iar resursele sunt ce faci accesibil tuturor.",
});

export interface PrimaPanelProps {
  plan: LessonPlan;
  recommendations: readonly Recommendation[];
  onApply: (recommendation: Recommendation) => void;
  onDismiss: (recommendationId: string) => void;
}

/**
 * PRIMA, beside the work.
 *
 * Not a chat and not an assistant window: there is no message list, no input
 * and nothing to reply to. It shows the lesson's balance, offers at most three
 * concrete edits with `Aplică` / `Nu acum`, and then goes quiet. CH02 Law 8 —
 * present, never dominant.
 */
export function PrimaPanel({
  plan,
  recommendations,
  onApply,
  onDismiss,
}: PrimaPanelProps) {
  const score = designScore(plan);
  const planned = totalPlannedMinutes(plan);
  const stillNeeded = sectionsStillNeeded(plan);

  const dimensions: DesignScoreDimension[] = [
    "curriculum",
    "activities",
    "assessment",
    "differentiation",
    "timeBalance",
    "accessibility",
  ].map((key) => {
    const id = key as keyof typeof DESIGN_SCORE_LABEL;
    return {
      id,
      label: DESIGN_SCORE_LABEL[id],
      score: score[id],
      note: DIMENSION_NOTE[id],
    };
  });

  return (
    <aside
      aria-label="PRIMA"
      className="hidden h-full w-[22rem] shrink-0 flex-col overflow-y-auto border-l border-border bg-panel laptop:flex"
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-5">
        <PrimaMark size={20} decorative />
        <span className="font-display text-base font-semibold text-foreground">
          PRIMA
        </span>
        <span className="ml-auto text-[0.75rem] text-subtle">
          Te ghidează — nu te evaluează.
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <DesignScoreMeter dimensions={dimensions} overall={score.overall} />

        {recommendations.length > 0 ? (
          <div className="flex flex-col gap-4">
            {recommendations.map((recommendation) => (
              <FloatingSuggestion
                key={recommendation.id}
                title={recommendation.title}
                message={recommendation.message}
                onApply={() => onApply(recommendation)}
                onDismiss={() => onDismiss(recommendation.id)}
              />
            ))}
          </div>
        ) : null}

        <section
          aria-labelledby="prima-timp"
          className="rounded-lg bg-surface p-5 ring-1 ring-border"
        >
          <h3 id="prima-timp" className="text-base font-semibold text-strong">
            Timpul lecției
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Momentele însumează {planned} din cele {plan.durationMinutes} de
            minute planificate.
          </p>
        </section>

        {stillNeeded.length > 0 ? (
          <section
            aria-labelledby="prima-de-completat"
            className="rounded-lg bg-accent-soft p-5 ring-1 ring-accent/30"
          >
            <h3
              id="prima-de-completat"
              className="text-base font-semibold text-strong"
            >
              Mai avem nevoie de câteva informații
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Înainte de materiale, aceste secțiuni așteaptă câteva rânduri:
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {stillNeeded.map((section) => (
                <li key={section} className="text-sm text-foreground">
                  {LESSON_SECTION_LABEL[section]}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.8125rem] text-muted-foreground">
              Poți completa acum sau mai târziu — lecția rămâne salvată.
            </p>
          </section>
        ) : null}
      </div>
    </aside>
  );
}
