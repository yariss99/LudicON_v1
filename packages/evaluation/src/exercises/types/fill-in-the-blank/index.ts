import { z } from "zod";
import type { ValidationIssue } from "@ludicon/domain";
import {
  answerCountMismatch,
  answerEmpty,
  textMissing,
  type ItemNoun,
} from "../../checks.js";
import type { ExerciseDefinition } from "../../definition.js";
import { exerciseLayout } from "../../layouts.js";
import { positionMarker } from "../../markers.js";
import {
  countMatching,
  countOf,
  matchesAccepted,
  proportional,
  stringsFrom,
  unanswered,
} from "../../scoring.js";

/**
 * Completează spațiile — a sentence with holes in it, and what may go in each.
 *
 * ## The blank is a mark IN the text, not a list of segments
 *
 * The structured alternative is the obvious one and it was rejected: store
 * `segments: { text: string; blank: boolean }[]` and give the panel an "adaugă
 * un spațiu" button. It is tidier in the model and it is a worse tool. A
 * teacher writes one sentence; writing it as five segments means five controls,
 * five places the cursor can be, and no way at all to paste the sentence in
 * from the document the lesson already came from — which is how most of these
 * exercises actually start. Three underscores in one box is a convention every
 * teacher already types by hand.
 *
 * The price is that the text has to be parsed rather than read, so the parse is
 * exported. `splitOnBlanks` is the ONE place that decides where the holes are,
 * and the renderer, the checks and the panel all call it. Two parsers would
 * eventually disagree about `____` at the end of a line, and the disagreement
 * would surface as a barem holding four answers for a sentence that prints
 * three blanks — which is a whole class marked against the wrong words.
 *
 * ## The accepted spellings are NOT in the config
 *
 * `blanks` belongs to the answer and lives in `document.answerKey`. Writing
 * them into the text instead — "capitala este ___(București)" — would be
 * simpler than either design and would print the answers onto the pupil's own
 * paper the first time anyone forgot to strip them out.
 *
 * ## Several spellings per blank, because a person marks this
 *
 * "București" and "bucuresti" are the same answer, and `matchesAccepted`
 * already folds case, diacritics and stray spaces. What the list carries is the
 * decisions only the teacher can make — whether "a mers" also passes where
 * "mergea" was wanted — rather than the ones a keyboard forced.
 */

const NAME = "Completează spațiile";
const NOUN: ItemNoun = { one: "spațiul", many: "spații" };

/**
 * Three underscores or more, which is how a blank is typed by hand anyway.
 *
 * Three rather than one, because a lone underscore turns up inside words a
 * teacher may legitimately write and a run of three does not occur in Romanian
 * prose. The flag is global and this regex is only ever handed to
 * `String.prototype.split`, which runs against its own copy — so no caller can
 * be caught out by a `lastIndex` another caller left behind.
 */
export const BLANK_MARKER = /_{3,}/g;

export interface BlankSplit {
  /** The literal text around the holes. Always exactly `blanks + 1` entries. */
  readonly parts: readonly string[];
  readonly blanks: number;
}

/** Where the holes are, decided once for the paper, the checks and the panel. */
export const splitOnBlanks = (text: string): BlankSplit => {
  const parts = text.split(BLANK_MARKER);
  return { parts, blanks: parts.length - 1 };
};

export const FillInTheBlankConfig = z.object({
  text: z.string().max(4000).default(""),
  /** How much room the pupil is given to write, in millimetres. */
  blankWidthMm: z.number().min(8).max(80).default(22),
});
export type FillInTheBlankConfig = z.infer<typeof FillInTheBlankConfig>;

export const FillInTheBlankAnswer = z.object({
  /** Accepted spellings for each blank, in the order the blanks print. */
  blanks: z.array(z.array(z.string().max(200)).max(6)).max(12),
});
export type FillInTheBlankAnswer = z.infer<typeof FillInTheBlankAnswer>;

export const fillInTheBlankExercise: ExerciseDefinition<
  FillInTheBlankConfig,
  FillInTheBlankAnswer
> = {
  type: "fill-in-the-blank",
  category: "grammar",

  labels: {
    name: NAME,
    description: "Elevul completează cuvintele care lipsesc dintr-un text.",
    keywords: [
      "completeaza",
      "spatii libere",
      "cuvinte lipsa",
      "text lacunar",
      "puncte puncte",
      "gramatica",
    ],
  },

  configSchema: FillInTheBlankConfig,
  answerSchema: FillInTheBlankAnswer,

  /**
   * An empty box, not a sentence with a hole already in it.
   *
   * A sample sentence is text the teacher has to select and delete before they
   * can write their own, and it would make an unwritten exercise look finished
   * to every check in the product.
   */
  defaults: { text: "", blankWidthMm: 22 },

  layouts: [exerciseLayout("standard", 24), exerciseLayout("card", 30)],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.text.trim() === "") {
      issues.push(
        textMissing(
          NAME,
          "textul de completat",
          "Scrie propoziția și pune ___ acolo unde elevul completează.",
        ),
      );
      return issues;
    }

    if (splitOnBlanks(config.text).blanks === 0) {
      issues.push(
        textMissing(
          NAME,
          "niciun loc de completat",
          "Pune ___ (cel puțin trei liniuțe) acolo unde elevul scrie.",
        ),
      );
    }

    return issues;
  },

  validateAnswer(config, answer) {
    const issues: ValidationIssue[] = [];

    if (answer.blanks.length !== splitOnBlanks(config.text).blanks) {
      issues.push(answerCountMismatch(NAME, NOUN));
    }

    // `every` on an empty list is true, so this covers both "no spellings at
    // all" and "a row of blank lines the teacher left behind".
    const unwritten = answer.blanks.some((accepted) =>
      accepted.every((spelling) => spelling.trim() === ""),
    );
    if (unwritten) {
      issues.push(
        answerEmpty(NAME, "Completează ce accepți pentru fiecare spațiu."),
      );
    }

    return issues;
  },

  describeAnswer(_config, answer) {
    return answer.blanks
      .map((accepted, index) => {
        const spellings = accepted
          .map((spelling) => spelling.trim())
          .filter((spelling) => spelling !== "")
          .join(" / ");
        return `${positionMarker(index)} ${spellings}`.trim();
      })
      .join("; ");
  },

  score(_config, key, response) {
    const written = stringsFrom(response);
    if (written === null) return unanswered();

    return proportional(
      countMatching(
        key.blanks,
        written,
        (accepted, given) =>
          typeof given === "string" && matchesAccepted(accepted, given),
      ),
      countOf(key.blanks),
    );
  },
};
