import { useCallback, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-form";
import type { LessonPlan } from "@ludicon/domain";
import { toast } from "@ludicon/ui";

import { FlowActions, FlowHeader, StepHeading } from "./flow-chrome";
import {
  FIELDS_BY_STEP,
  FIRST_STEP,
  LAST_STEP,
  STEPS,
  STEP_COUNT,
} from "./flow-form";
import {
  isUntouchedSeed,
  kindQuestion,
  kindSeed,
  type MaterialKind,
} from "./material-kinds";
import { readIntent } from "./read-intent";
import { startExperience, type ExperienceDraft } from "./start-experience";
import { StepContext } from "./step-context";
import { focusStepTarget } from "./step-focus";
import { StepIndicator } from "./step-indicator";
import { StepIntent } from "./step-intent";
import { StepKind } from "./step-kind";
import { useCreateFlowForm } from "./use-create-flow";

const COULD_NOT_START =
  "Nu am putut porni lecția acum. Ce ai scris este păstrat — încearcă din nou.";

const HEADING: Readonly<Record<number, string>> = Object.freeze({
  1: "Ce vrei să pregătești?",
  3: "Am înțeles cam așa",
});

const SUPPORTING: Readonly<Record<number, string>> = Object.freeze({
  1: "Alege de unde pornim. Poți reveni oricând la acest pas.",
  2: "Spune-mi cu cuvintele tale. Nu e nevoie să completezi nimic dinainte — pornim de la ce ai în minte și limpezim restul împreună.",
  3: "Am completat ce se citea din ce ai scris. Schimbă orice nu se potrivește.",
});

export interface CreateExperienceFlowProps {
  initialKind: MaterialKind;
  initialDescription: string;
  /** The URL already named the material, so the first step is answered. */
  kindWasChosen: boolean;
  onKindChange: (kind: MaterialKind) => void;
  onCreated: (plan: LessonPlan) => Promise<void>;
}

/**
 * Three stops between an idea and a lesson design.
 *
 * Deliberately not a wizard: no step asks for anything the teacher has not
 * already implied, every step is reachable in both directions, and the last
 * one only shows back what was understood. The single form instance holds the
 * position in the flow along with the answers, so there is one place to read
 * from and one place to move.
 */
export function CreateExperienceFlow({
  initialKind,
  initialDescription,
  kindWasChosen,
  onKindChange,
  onCreated,
}: CreateExperienceFlowProps) {
  const start = useMutation({
    mutationFn: startExperience,
    onSuccess: onCreated,
  });

  const onStart = useCallback(
    async (draft: ExperienceDraft) => {
      try {
        await start.mutateAsync(draft);
      } catch {
        toast.error(COULD_NOT_START);
      }
    },
    [start],
  );

  const form = useCreateFlowForm({
    initialStep: kindWasChosen ? 2 : FIRST_STEP,
    initialKind,
    initialDescription,
    onStart,
  });

  const step = useStore(form.store, (state) => state.values.step);
  const kind = useStore(form.store, (state) => state.values.kind);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);
  const bodyRef = useRef<HTMLDivElement>(null);

  // A plain effect, not an animation frame: a backgrounded tab never paints,
  // so a frame-scheduled focus would simply never happen there.
  useEffect(() => {
    focusStepTarget(bodyRef.current);
  }, [step]);

  /**
   * Fills in what the sentence said, leaving anything the teacher changed.
   *
   * The test is `isDirty`, not `isTouched`: tabbing past a field, or simply
   * clicking the next one, marks it touched — and taking the "read from what
   * you wrote" mark away for that would make the mark a lie in both directions.
   */
  const applyReading = useCallback(() => {
    const reading = readIntent(form.state.values.description);
    if (!form.getFieldMeta("subject")?.isDirty && reading.subject) {
      form.setFieldValue("subject", reading.subject, { dontUpdateMeta: true });
    }
    if (reading.grade && !form.getFieldMeta("grade")?.isDirty) {
      form.setFieldValue("grade", reading.grade, { dontUpdateMeta: true });
    }
    if (
      reading.durationMinutes !== null &&
      !form.getFieldMeta("durationMinutes")?.isDirty
    ) {
      form.setFieldValue("durationMinutes", reading.durationMinutes, {
        dontUpdateMeta: true,
      });
    }
  }, [form]);

  const goToStep = useCallback(
    async (next: number) => {
      const current = form.state.values.step;
      if (next <= current) {
        form.setFieldValue("step", Math.max(FIRST_STEP, next));
        return;
      }

      const owned = FIELDS_BY_STEP[current] ?? [];
      const results = await Promise.all(
        owned.map((name) => form.validateField(name, "submit")),
      );
      if (!results.every((issues: unknown[]) => issues.length === 0)) return;

      const target = Math.min(next, LAST_STEP);
      if (target === LAST_STEP) applyReading();
      form.setFieldValue("step", target);
    },
    [applyReading, form],
  );

  const chooseKind = useCallback(
    (chosen: MaterialKind) => {
      if (isUntouchedSeed(form.state.values.description)) {
        form.setFieldValue("description", kindSeed(chosen), {
          dontUpdateMeta: true,
        });
      }
      onKindChange(chosen);
    },
    [form, onKindChange],
  );

  /** If a hidden field ever blocks the finish, send the teacher to it. */
  const submit = useCallback(async () => {
    // Finishing is only ever the last step's business. Nothing else may start
    // a project on the teacher's behalf, whatever else reached this handler.
    if (form.state.values.step !== LAST_STEP) return;

    await form.handleSubmit();
    const stuck = STEPS.find((candidate) =>
      (FIELDS_BY_STEP[candidate.index] ?? []).some(
        (name) => (form.getFieldMeta(name)?.errors.length ?? 0) > 0,
      ),
    );
    if (stuck && stuck.index !== form.state.values.step) {
      form.setFieldValue("step", stuck.index);
    }
  }, [form]);

  const heading = step === 2 ? kindQuestion(kind) : (HEADING[step] ?? "");
  const summary = STEPS.find((candidate) => candidate.index === step)?.summary;

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <FlowHeader />

      <main id="continut" className="flex-1 px-6 pt-4 pb-16" role="main">
        <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-8">
          <StepIndicator
            current={step}
            onGoBack={(target) => {
              void goToStep(target);
            }}
          />

          <form
            className="flex flex-col gap-8"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void submit();
            }}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || step === FIRST_STEP) return;
              const target = event.target;
              if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement
              ) {
                return;
              }
              void goToStep(step - 1);
            }}
          >
            <div ref={bodyRef} className="flex flex-col gap-6">
              <StepHeading
                step={step}
                kind={kind}
                title={heading}
                supporting={SUPPORTING[step] ?? ""}
              />

              {step === 1 ? (
                <StepKind form={form} onChoose={chooseKind} />
              ) : null}
              {step === 2 ? <StepIntent form={form} /> : null}
              {step === LAST_STEP ? <StepContext form={form} /> : null}
            </div>

            <FlowActions
              step={step}
              isSubmitting={isSubmitting}
              onGo={(target) => {
                void goToStep(target);
              }}
            />
          </form>

          <p aria-live="polite" className="sr-only">
            {`Pasul ${step} din ${STEP_COUNT}${summary ? `. ${summary}` : ""}`}
          </p>
        </div>
      </main>
    </div>
  );
}
