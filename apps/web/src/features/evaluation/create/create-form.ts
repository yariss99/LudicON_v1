import { Discipline, GradeLevel } from "@ludicon/domain";
import { z } from "zod";

import { EVALUATION_COPY } from "../copy";

/**
 * The shape of the create form, and the only place its rules are written.
 *
 * Zod 4 goes straight into TanStack Form as a Standard Schema — no adapter — so
 * these schemas are both the validation and the messages the teacher reads.
 * Keeping them out of the component means the rule and the field cannot drift,
 * and the message stays in `copy.ts` where the UX-001 ban list is checked.
 *
 * `discipline` and `grade` are typed as "the enum, or nothing chosen yet"
 * rather than defaulting to a real value. A form that arrives with
 * "Matematică" already picked is a form that files half the papers in the
 * school under mathematics, because a default nobody chose is indistinguishable
 * from a choice once it is stored. The document model allows both to be null
 * for the same reason; the create form is stricter because this is the one
 * moment the teacher has the answer in mind.
 */

export const DEFAULT_DURATION_MINUTES = 50;

/** Nothing chosen yet. A separate value from every real option. */
export const UNCHOSEN = "";

export interface CreatePaperValues {
  title: string;
  description: string;
  discipline: Discipline | typeof UNCHOSEN;
  grade: GradeLevel | typeof UNCHOSEN;
  durationMinutes: number;
}

export const CREATE_DEFAULTS: CreatePaperValues = {
  title: "",
  description: "",
  discipline: UNCHOSEN,
  grade: UNCHOSEN,
  durationMinutes: DEFAULT_DURATION_MINUTES,
};

export const TitleSchema = z
  .string()
  .trim()
  .min(2, EVALUATION_COPY.titleNeeded)
  .max(200, EVALUATION_COPY.titleNeeded);

export const DescriptionSchema = z.string().max(2000);

/**
 * "One of the disciplines, or nothing yet" — and nothing yet is not an answer.
 *
 * The union rather than a bare `z.string()`: TanStack Form checks that a
 * validator's INPUT type matches the field's, and the field is
 * `Discipline | ""`. A `z.string()` schema validates the same values at runtime
 * and would be accepted here only by widening the field, which is how a form
 * ends up storing a typo as a discipline.
 */
export const DisciplineSchema = z
  .union([Discipline, z.literal(UNCHOSEN)])
  .refine(
    (value): value is Discipline => value !== UNCHOSEN,
    EVALUATION_COPY.disciplineNeeded,
  );

export const GradeSchema = z
  .union([GradeLevel, z.literal(UNCHOSEN)])
  .refine(
    (value): value is GradeLevel => value !== UNCHOSEN,
    EVALUATION_COPY.gradeNeeded,
  );

export const DurationSchema = z
  .number()
  .int(EVALUATION_COPY.durationNeeded)
  .min(5, EVALUATION_COPY.durationNeeded)
  .max(240, EVALUATION_COPY.durationNeeded);

/**
 * Reads a message out of whatever a validator produced.
 *
 * A Standard Schema issue arrives as an object carrying `message`; a plain
 * function validator arrives as a string. Both are possible on one field, so
 * the render path narrows rather than assuming — the same helper
 * `legacy/create-experience-flow/flow-form.ts` needed for the same reason.
 */
const messageOf = (error: unknown): string | undefined => {
  if (typeof error === "string") return error.length > 0 ? error : undefined;
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error;
    return typeof message === "string" && message.length > 0
      ? message
      : undefined;
  }
  return undefined;
};

/** The first thing worth saying about a field, or nothing. */
export function firstMessage(errors: readonly unknown[]): string | undefined {
  for (const error of errors) {
    const message = messageOf(error);
    if (message) return message;
  }
  return undefined;
}
