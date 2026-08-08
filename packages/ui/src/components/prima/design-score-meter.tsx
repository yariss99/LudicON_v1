import { useId } from "react";

import { cn } from "../../lib/cn";

export interface DesignScoreDimension {
  id: string;
  /** Romanian dimension name — a pedagogical noun, not a metric name. */
  label: string;
  /** 0–100. Clamped on render, so a bad number never draws outside the track. */
  score: number;
  /**
   * What would make this dimension fuller.
   *
   * Required in spirit whenever the score is low: CH12 says a low dimension
   * gets amber *plus an explanation*, never a bare warning colour. When it is
   * missing, a neutral supportive line stands in.
   */
  note?: string;
}

export interface DesignScoreMeterProps {
  /** The seven dimensions of the lesson's balance. */
  dimensions: DesignScoreDimension[];
  /** Optional roll-up, shown as a plain number. Never a letter, never a mark. */
  overall?: number;
  title?: string;
  className?: string;
}

/** Below this, a dimension asks for attention — in amber, with words. */
const ATTENTION_BELOW = 60;

const DEFAULT_ATTENTION_NOTE =
  "Această parte a lecției e mai subțire decât restul. Poți completa acum sau mai târziu.";

function clamp(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * The lesson's balance, shown as support.
 *
 * Two rules from CH12 shape everything here. First: soft emerald fills, and
 * never traffic-light red for a low dimension — a low score means "this part
 * is thin", not "you failed", so it draws in amber and always brings a
 * sentence with it. Second: it is announced as a support metric. The number and
 * its explanation are both plain text, so a screen reader gets the whole
 * meaning without the bars; the bars are `aria-hidden` decoration on top.
 *
 * The mandated line `Te ghidează — nu te evaluează.` is part of the component,
 * not of the page, so no surface can ship this meter without it.
 *
 * The design book does not enumerate which seven dimensions these are — the
 * list comes from the domain and is passed in.
 */
export function DesignScoreMeter({
  dimensions,
  overall,
  title = "Echilibrul lecției",
  className,
}: DesignScoreMeterProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col gap-5 rounded-lg bg-surface p-6 ring-1 ring-border",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3
            id={titleId}
            className="text-lg font-semibold leading-[1.35] text-strong"
          >
            {title}
          </h3>
          <p className="text-base leading-[1.55] text-muted-foreground">
            Te ghidează — nu te evaluează.
          </p>
        </div>
        {typeof overall === "number" ? (
          <p className="shrink-0 text-right">
            <span className="text-xl font-semibold leading-none text-strong">
              {clamp(overall)}
            </span>
            <span className="ml-1 text-[0.8125rem] text-muted-foreground">
              din 100
            </span>
          </p>
        ) : null}
      </div>

      <ul className="flex flex-col gap-4">
        {dimensions.map((dimension) => {
          const score = clamp(dimension.score);
          const needsAttention = score < ATTENTION_BELOW;

          return (
            <li key={dimension.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base leading-[1.5] text-foreground">
                  {dimension.label}
                </span>
                <span className="shrink-0 text-[0.8125rem] font-medium text-muted-foreground">
                  {score} din 100
                </span>
              </div>

              <div
                aria-hidden
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              >
                {/* Scaled, not resized. Animating `width` is a layout
                    animation: it forces reflow every frame and it is the same
                    class of change that made the workspace tab strip move out
                    from under a pointer. `transform` runs on the compositor and
                    changes no geometry, so the row above never shifts. */}
                <div
                  className={cn(
                    "h-full origin-left rounded-full",
                    "transition-transform duration-[var(--motion-standard)] ease-standard",
                    needsAttention ? "bg-warning" : "bg-secondary",
                  )}
                  style={{
                    transform: `scaleX(${String(score / 100)})`,
                    width: "100%",
                  }}
                />
              </div>

              {needsAttention ? (
                <p className="text-[0.8125rem] leading-[1.5] text-muted-foreground">
                  {dimension.note ?? DEFAULT_ATTENTION_NOTE}
                </p>
              ) : dimension.note ? (
                <p className="text-[0.8125rem] leading-[1.5] text-muted-foreground">
                  {dimension.note}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-[0.8125rem] leading-[1.5] text-subtle">
        Scorul te ajută să vezi echilibrul lecției — nu este o notă.
      </p>
    </section>
  );
}
