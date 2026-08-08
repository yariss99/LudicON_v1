import { useRef } from "react";
import { revalidateLogic, useForm } from "@tanstack/react-form";

import { DEFAULT_DURATION_MINUTES } from "./read-intent";
import type { CreateFlowValues } from "./flow-form";
import type { MaterialKind } from "./material-kinds";
import type { ExperienceDraft } from "./start-experience";

export interface UseCreateFlowOptions {
  initialStep: number;
  initialKind: MaterialKind;
  initialDescription: string;
  onStart: (draft: ExperienceDraft) => Promise<void>;
}

/**
 * One form instance for the whole flow.
 *
 * `revalidateLogic` is what keeps the screen quiet: nothing is checked while
 * the teacher is still typing a word, only when they leave the field or ask
 * to move on — and after that first ask, corrections clear as they are made.
 *
 * The defaults are captured once. They are read from the URL, and the URL
 * changes as soon as a card is chosen; re-reading them would hand the teacher
 * back the opening phrase they had just replaced.
 */
export function useCreateFlowForm({
  initialStep,
  initialKind,
  initialDescription,
  onStart,
}: UseCreateFlowOptions) {
  const initial = useRef<CreateFlowValues>({
    step: initialStep,
    kind: initialKind,
    description: initialDescription,
    subject: "",
    grade: "clasa_3",
    durationMinutes: DEFAULT_DURATION_MINUTES,
  });

  return useForm({
    defaultValues: initial.current,
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "change",
    }),
    onSubmit: async ({ value }) => {
      await onStart({
        kind: value.kind,
        description: value.description,
        subject: value.subject,
        grade: value.grade,
        durationMinutes: value.durationMinutes,
      });
    },
  });
}

export type CreateFlowForm = ReturnType<typeof useCreateFlowForm>;
