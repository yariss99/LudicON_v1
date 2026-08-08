import { Link } from "@tanstack/react-router";
import { Badge, Button, PrimaMark } from "@ludicon/ui";

import { FIRST_STEP, LAST_STEP } from "./flow-form";
import { kindIcon, kindLabel, type MaterialKind } from "./material-kinds";

/**
 * The page's own header.
 *
 * Full-bleed, outside the studio shell: creation is one thought, and the rail
 * would offer six ways to leave it. The way back is one quiet link.
 */
export function FlowHeader() {
  return (
    <header
      className="flex h-16 shrink-0 items-center gap-4 px-6"
      role="banner"
    >
      <Link
        to="/"
        className="flex min-h-11 items-center gap-2"
        aria-label="PRIMA — Biroul meu"
      >
        <PrimaMark size={20} />
        <span className="font-display font-semibold text-foreground">
          PRIMA
        </span>
      </Link>
      <div className="flex-1" />
      <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
        <Link to="/">Înapoi la Biroul meu</Link>
      </Button>
    </header>
  );
}

export interface StepHeadingProps {
  step: number;
  kind: MaterialKind;
  title: string;
  supporting: string;
}

/** What is being made, what this step asks, and one line of support. */
export function StepHeading({
  step,
  kind,
  title,
  supporting,
}: StepHeadingProps) {
  const Icon = kindIcon(kind);

  return (
    <div className="flex flex-col gap-3">
      {step > FIRST_STEP ? (
        <Badge
          tone="info"
          className="self-start"
          icon={Icon ? <Icon aria-hidden strokeWidth={1.75} /> : undefined}
        >
          {kindLabel(kind)}
        </Badge>
      ) : null}
      <h1 className="font-display text-[2rem] leading-[1.2] font-semibold text-strong">
        {title}
      </h1>
      <p className="max-w-[65ch] text-[1.0625rem] leading-[1.6] text-muted-foreground">
        {supporting}
      </p>
    </div>
  );
}

export interface FlowActionsProps {
  step: number;
  isSubmitting: boolean;
  onGo: (step: number) => void;
}

/**
 * One filled action per step, with the way back beside it.
 *
 * The keys matter. Without them React reuses a single `<button>` node across
 * steps, so the click that leaves step 2 finishes against a node that has
 * meanwhile become the submit button — and the browser runs that submission as
 * the same click's default action, skipping the last step entirely.
 */
export function FlowActions({ step, isSubmitting, onGo }: FlowActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {step === LAST_STEP ? (
          <Button
            key="finish"
            type="submit"
            variant="primary"
            size="lg"
            className="cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Se pregătește…" : "Creează proiectul"}
          </Button>
        ) : (
          <Button
            key="next"
            type="button"
            variant="primary"
            size="lg"
            className="cursor-pointer"
            onClick={() => onGo(step + 1)}
          >
            Continuă
          </Button>
        )}

        {/* Forward first, back second. The primary action is the one the
            teacher came here to take; putting the retreat ahead of it made the
            row read as "leave, or continue". */}
        {step > FIRST_STEP ? (
          <Button
            key="back"
            type="button"
            variant="ghost"
            size="lg"
            className="cursor-pointer"
            onClick={() => onGo(step - 1)}
          >
            Înapoi
          </Button>
        ) : null}
      </div>
      <p className="text-[0.9375rem] leading-[1.5] text-muted-foreground">
        Poți schimba orice detaliu mai târziu, în designul lecției.
      </p>
    </div>
  );
}
