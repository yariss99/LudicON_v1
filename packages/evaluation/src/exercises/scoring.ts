import type { ExerciseScore } from "./definition.js";

/**
 * Marking helpers, written once so fourteen types mark the same way.
 *
 * Every `score` in this package answers the same three questions — how much was
 * earned, out of how much, and does that count as correct — and if each type
 * answered them privately they would drift: one would round partial credit to
 * two decimals, another would leave 0.6666666666666666 in a barem a teacher
 * reads, and a third would call a half-right answer "correct". These are the
 * shared answers.
 *
 * `response` arrives as `unknown` because it comes from outside the document —
 * a scan, an import, a future capture screen — so every narrowing lives here as
 * a total function that returns `null` rather than throwing. A marker that
 * crashes on a malformed response is a marker that cannot finish a class.
 *
 * The rejected alternative was scoring with the answer schemas: `safeParse` on
 * every response would be correct and would also mean a pupil who wrote "3 "
 * instead of "3" scores zero on a parse failure rather than on a wrong answer.
 * Scoring is deliberately more forgiving than validation.
 */

/**
 * Case, diacritics and runs of whitespace folded away.
 *
 * Romanian handwriting transcribed by a teacher will not consistently carry ș,
 * ț or â, and a pupil who wrote "casa   mare" wrote the same words as one who
 * wrote "Casa mare". `normalize("NFD")` splits the letter from its mark and the
 * range strips the marks, so no substitution table has to be maintained.
 *
 * Only text answers use this. A maths result must not be folded — "1,5" and
 * "1.5" differ by a decision the marker should make, not by an accident of
 * typing — which is why `numberFrom` below is separate and explicit about it.
 */
export const foldAnswerText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

/**
 * Whether a written response matches any of the accepted spellings.
 *
 * The list is re-checked at runtime even though its type says it is an array.
 * `score` is handed a `key` that `answerSchema` has parsed — that is the
 * contract, and `validateProject` enforces it — but a barem can also reach a
 * marking screen straight out of storage, written by an older version of a
 * schema that has since changed shape. This module's whole job is narrowing
 * data it did not create, and the cost of being right about it is one
 * `Array.isArray`.
 */
export const matchesAccepted = (
  accepted: readonly string[],
  response: string,
): boolean => {
  if (!Array.isArray(accepted)) return false;
  const written = foldAnswerText(response);
  if (written === "") return false;
  return accepted.some(
    (option) =>
      typeof option === "string" && foldAnswerText(option) === written,
  );
};

/**
 * A number written the way a Romanian pupil writes it.
 *
 * The comma is the decimal separator taught in Romanian schools, so "1,5" is
 * the expected spelling and "1.5" is what a keyboard produces. Both are read as
 * one and a half. Spaces are dropped because "1 200" is how thousands are
 * grouped by hand.
 */
export const numberFrom = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;

  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

export const stringFrom = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

export const stringsFrom = (value: unknown): readonly string[] | null =>
  Array.isArray(value) && value.every((item) => typeof item === "string")
    ? (value as readonly string[])
    : null;

export const numbersFrom = (value: unknown): readonly number[] | null =>
  Array.isArray(value) && value.every((item) => typeof item === "number")
    ? (value as readonly number[])
    : null;

export const booleansFrom = (value: unknown): readonly boolean[] | null =>
  Array.isArray(value) && value.every((item) => typeof item === "boolean")
    ? (value as readonly boolean[])
    : null;

/**
 * Two decimal places, and no floating-point residue.
 *
 * A barem is added up by a person. `0.30000000000000004` printed beside a
 * question is the product telling a teacher their arithmetic is wrong, so
 * partial credit is rounded to the smallest unit anyone writes on a Romanian
 * paper — a hundredth of a point.
 */
const toHundredths = (value: number): number => Math.round(value * 100) / 100;

/**
 * ## Every `score` below marks OUT OF ONE
 *
 * `ExerciseDefinition.score` is handed the config, the barem answer and the
 * response — and deliberately not the points. Points live on the `AnswerEntry`
 * and on the block, because the same question is worth two points on one paper
 * and five on another; a definition that took them would be answering a
 * question about the barem while pretending to answer one about the response.
 *
 * So a type returns a fraction, and whoever holds the entry multiplies it with
 * `scaleScore`. The alternative — passing points down into every type — puts
 * the same multiplication in fourteen places and makes "half marks" a decision
 * each type reinvents.
 */

/** Right or nothing. The shape of a single-answer question. */
export const allOrNothing = (correct: boolean): ExerciseScore => ({
  earned: correct ? 1 : 0,
  max: 1,
  correct,
});

/**
 * Credit in proportion to how much was right.
 *
 * `correct` is true only when every part is right, not when the fraction passes
 * some threshold. "Correct" is a fact about the answer; how many points that is
 * worth is a fact about the barem, and conflating them would make a paper's
 * summary disagree with its own marks.
 */
export const proportional = (matched: number, total: number): ExerciseScore => {
  if (total <= 0) return { earned: 0, max: 1, correct: false };

  const clamped = Math.max(0, Math.min(matched, total));
  return {
    earned: toHundredths(clamped / total),
    max: 1,
    correct: clamped === total,
  };
};

/**
 * Nothing earned, for a response that could not be read at all.
 *
 * Distinct from `allOrNothing(false)` only in intent, and kept separate so a
 * reader of a type's `score` can see which branch is "wrong answer" and which
 * is "no answer I could make sense of".
 */
export const unanswered = (): ExerciseScore => allOrNothing(false);

/**
 * The unit score, in the points the barem actually awards.
 *
 * Called by whoever holds the `AnswerEntry`; never by a type. Rounding happens
 * here rather than at the fraction so that three of four right at five points
 * is 3.75 and not 0.75 rounded then multiplied.
 */
export const scaleScore = (
  score: ExerciseScore,
  points: number,
): ExerciseScore => ({
  earned: toHundredths((score.earned / (score.max || 1)) * points),
  max: toHundredths(points),
  correct: score.correct,
});

/**
 * How many entries of two same-length lists agree.
 *
 * A response longer or shorter than the key scores on the key's length, so a
 * pupil who skipped the last blank loses that blank and keeps the rest.
 *
 * Both sides are re-checked at runtime, for the reason `matchesAccepted` gives:
 * the types promise a parsed barem, and a barem can still arrive from storage
 * under a schema that has since moved on. Zero matches out of a key that is not
 * a list is the honest answer — it marks nothing right, which is what an
 * unreadable barem deserves, rather than taking the marker down mid-class.
 */
export const countMatching = <T>(
  key: readonly T[],
  response: readonly unknown[],
  same: (expected: T, given: unknown) => boolean,
): number => {
  if (!Array.isArray(key)) return 0;
  const given = Array.isArray(response) ? response : [];
  return key.reduce(
    (total, expected, index) =>
      same(expected, given[index]) ? total + 1 : total,
    0,
  );
};

/**
 * The length of something the barem says is a list.
 *
 * The denominator of every `proportional` call, and the one place a malformed
 * barem would otherwise throw before `countMatching` could absorb it. Zero
 * makes `proportional` return an empty score rather than dividing by nothing.
 */
export const countOf = (value: unknown): number =>
  Array.isArray(value) ? value.length : 0;
