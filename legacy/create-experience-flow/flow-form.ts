import type { GradeLevel } from "@ludicon/domain";
import { z } from "zod";

import { MaterialKind, withoutSeed } from "./material-kinds";

/**
 * The whole flow, described once.
 *
 * Three short stops, not a wizard: every one of them is reachable in either
 * direction and none of them asks for anything the teacher has not already
 * implied. The last one only shows back what was understood, for correction.
 */

export const STEP_COUNT = 3;

export interface FlowStep {
  /** 1-based, so it reads the same in the markup as it does out loud. */
  index: number;
  /** Two words at most — it sits under a 28px marker. */
  label: string;
  /** Announced to screen readers alongside "Pasul 2 din 3". */
  summary: string;
}

export const STEPS: readonly FlowStep[] = [
  { index: 1, label: "Materialul", summary: "Alege de unde pornim" },
  { index: 2, label: "Ideea", summary: "Scrie cu cuvintele tale" },
  { index: 3, label: "Clasa", summary: "Disciplina, clasa și durata" },
];

export const FIRST_STEP = 1;
export const LAST_STEP = STEP_COUNT;

/* ---- Field schemas. Zod 4 goes straight in as a Standard Schema. ---- */

export const NEEDS_WORDS =
  "Scrie câteva cuvinte despre lecție, ca să pornim de undeva.";

const TOO_MANY_WORDS =
  "E mai mult decât putem citi dintr-o dată — păstrează ideea principală.";

const NEEDS_SUBJECT =
  "Spune-ne disciplina, ca să potrivim conținutul cu programa.";

const SUBJECT_TOO_LONG = "Numele disciplinei e prea lung — scurtează-l puțin.";

const DURATION_OUT_OF_RANGE =
  "Alege o durată între 5 și 240 de minute, cât ține o oră de curs.";

/**
 * The opening phrase does not count as an answer.
 *
 * A card click seeds the field with "Vreau o fișă de lucru despre ", which is
 * long enough to pass a naive length check while saying nothing. Measuring
 * what is left after the phrase is removed is what makes the check honest.
 */
export const DescriptionSchema = z
  .string()
  .max(2000, TOO_MANY_WORDS)
  .refine((value) => withoutSeed(value.trim()).trim().length >= 3, NEEDS_WORDS);

export const SubjectSchema = z
  .string()
  .trim()
  .min(2, NEEDS_SUBJECT)
  .max(120, SUBJECT_TOO_LONG);

export const DurationSchema = z
  .number()
  .int(DURATION_OUT_OF_RANGE)
  .min(5, DURATION_OUT_OF_RANGE)
  .max(240, DURATION_OUT_OF_RANGE);

export const KindSchema = MaterialKind;

/**
 * One form instance carries the flow.
 *
 * `step` lives here with everything else on purpose: the position in the flow
 * is part of what the teacher has told us so far, and keeping it in the same
 * store means there is exactly one place to read from and one place to move.
 */
export interface CreateFlowValues {
  step: number;
  kind: MaterialKind;
  description: string;
  subject: string;
  grade: GradeLevel;
  durationMinutes: number;
}

/** The fields each step is responsible for, checked before moving forward. */
export const FIELDS_BY_STEP: Readonly<
  Record<number, readonly (keyof CreateFlowValues)[]>
> = Object.freeze({
  1: ["kind"],
  2: ["description"],
  3: ["subject", "durationMinutes"],
});

/**
 * Reads a message out of whatever a validator produced.
 *
 * Standard Schema issues arrive as objects with a `message`; a plain function
 * validator arrives as a string. Both are possible on the same field, so the
 * render path narrows instead of assuming.
 */
function messageOf(error: unknown): string | undefined {
  if (typeof error === "string") return error.length > 0 ? error : undefined;
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error;
    return typeof message === "string" && message.length > 0
      ? message
      : undefined;
  }
  return undefined;
}

/** The first thing worth saying about a field, or nothing. */
export function firstMessage(errors: readonly unknown[]): string | undefined {
  for (const error of errors) {
    const message = messageOf(error);
    if (message) return message;
  }
  return undefined;
}
