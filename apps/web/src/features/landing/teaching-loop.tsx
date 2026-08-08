import { SectionHeader, cn } from "@ludicon/ui";

import { LANDING_COPY, LOOP_STEPS, type LoopStep } from "./copy";

const { loop } = LANDING_COPY;

interface LoopRowProps {
  step: LoopStep;
  position: number;
}

/**
 * One step. The fourth one looks different because it *is* different.
 *
 * The numeral is `aria-hidden` — the ordered list already tells a screen reader
 * this is step four of six, and reading "4" twice is noise. The gate instead
 * announces itself in words, so its distinction survives with styling off.
 */
function LoopRow({ step, position }: LoopRowProps) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-md p-4 tablet:gap-5 tablet:p-5",
        step.isGate && "bg-primary-soft",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-base font-semibold tabular-nums",
          step.isGate
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-strong",
        )}
      >
        {position}
      </span>

      <div className="min-w-0">
        {/* The label rides beside the title rather than above it. Stacked, it
            sat closer to the numeral than to the words it qualifies and read as
            a caption on the "4". */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="text-base leading-[1.4] font-semibold text-strong tablet:text-lg">
            {step.title}
          </h3>
          {step.isGate ? (
            <span className="inline-flex items-center rounded-full bg-primary px-3 py-0.5 text-sm leading-[1.5] font-medium text-primary-foreground">
              {loop.gateLabel}
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 max-w-[62ch] text-base leading-[1.6] text-muted-foreground">
          {step.body}
        </p>
      </div>
    </div>
  );
}

/**
 * The loop, laid on a sheet.
 *
 * Vertical and numbered rather than a three-across feature grid, because the
 * order is the argument. A grid would say "here are six capabilities"; a column
 * says "this happens, then this, and here it stops and waits for you".
 *
 * The white plane against the grey canvas is the product's own metaphor — a
 * work sheet on a drafting table — so the public page and the desk behind the
 * login read as one place.
 */
export function TeachingLoop() {
  return (
    <section
      aria-labelledby="cum-se-lucreaza"
      className="reading-column px-6 tablet:px-8"
    >
      <div className="rounded-lg bg-surface p-6 shadow-soft ring-1 ring-border tablet:p-10">
        <SectionHeader
          id="cum-se-lucreaza"
          title={loop.heading}
          supporting={loop.supporting}
        />

        <ol className="mt-7 flex flex-col gap-1">
          {LOOP_STEPS.map((step, index) => (
            <li key={step.title}>
              <LoopRow step={step} position={index + 1} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
