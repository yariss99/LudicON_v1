import { z } from "zod";
import type { ValidationIssue } from "@ludicon/domain";
import {
  answerCountMismatch,
  answerEmpty,
  firstBlankItem,
  textMissing,
  tooFewItems,
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
 * A text to read, then questions about it.
 *
 * ## One block, not a paragraph piece plus three short-answer exercises
 *
 * The passage and its questions could have been assembled from pieces that
 * already exist, and that was rejected. They are one thing: moving the
 * exercise to another page has to take the text with it, the paginator has to
 * know they cannot be split across a page break, and `validateAnswer` has to be
 * able to say "the barem has two answers for three questions" — none of which
 * is expressible about four independent blocks that merely happen to sit next
 * to each other on today's layout.
 *
 * ## `answers` is positional, so its length is load-bearing
 *
 * The barem is a list parallel to `questions`: the third answer belongs to the
 * third question because of where it sits, not because anything links them.
 * That is why `validateAnswer` refuses a length mismatch outright rather than
 * marking what it can — a barem shifted by one question is not partly right, it
 * is a whole class marked against the wrong answers, and every row after the
 * gap looks perfectly plausible.
 *
 * The rejected alternative was keying answers by question text, which survives
 * reordering and breaks the moment a teacher fixes a typo in a question.
 *
 * ## The passage is stored as plain text
 *
 * No inline formatting, and the line breaks are kept exactly as typed. A
 * Romanian reading passage at this level is prose and dialogue, where the line
 * break IS the formatting — a new speaker starts a new line. Rich text would
 * have made the field a document model of its own for no reading a pupil does
 * differently.
 */

const NAME = "Text cu întrebări";
const NOUN: ItemNoun = { one: "întrebarea", many: "întrebări" };
const LEAST_QUESTIONS = 1;

export const ReadingComprehensionConfig = z.object({
  /** What the pupil reads. Line breaks are the teacher's and are kept. */
  passage: z.string().max(6000).default(""),
  /** Author or book, printed small under the passage. Optional. */
  source: z.string().max(200).default(""),
  questions: z.array(z.string().max(300)).max(8).default([]),
  /** Ruled lines printed under each question. */
  linesPerQuestion: z.number().int().min(1).max(8).default(2),
});
export type ReadingComprehensionConfig = z.infer<
  typeof ReadingComprehensionConfig
>;

export const ReadingComprehensionAnswer = z.object({
  /** One model answer per question, in the questions' own order. */
  answers: z.array(z.string().max(500)).max(8),
});
export type ReadingComprehensionAnswer = z.infer<
  typeof ReadingComprehensionAnswer
>;

export const readingComprehensionExercise: ExerciseDefinition<
  ReadingComprehensionConfig,
  ReadingComprehensionAnswer
> = {
  type: "reading-comprehension",
  category: "comprehension",

  labels: {
    name: NAME,
    description: "Elevul citește un text și răspunde la întrebări despre el.",
    keywords: [
      "text cu intrebari",
      "intelegerea textului",
      "lectura",
      "citeste textul",
      "raspunde la intrebari",
      "comprehensiune",
    ],
  },

  disciplines: ["limba_romana", "limba_engleza"],

  configSchema: ReadingComprehensionConfig,
  answerSchema: ReadingComprehensionAnswer,

  /**
   * Two empty questions, and an empty passage.
   *
   * Two rather than one because a text with a single question is rare enough
   * that the second row is nearly always wanted, and an empty row costs one
   * press of Backspace where a missing one costs finding the field again. Both
   * are blank: sample questions are text to delete, and they would also make
   * `firstBlankItem` answer "nothing is wrong" about an exercise nobody wrote.
   */
  defaults: {
    passage: "",
    source: "",
    questions: ["", ""],
    linesPerQuestion: 2,
  },

  layouts: [exerciseLayout("standard", 80), exerciseLayout("card", 86)],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.passage.trim() === "") {
      issues.push(
        textMissing(
          NAME,
          "textul de citit",
          "Lipește sau scrie textul pe care îl citesc elevii.",
        ),
      );
    }

    if (config.questions.length < LEAST_QUESTIONS) {
      issues.push(
        tooFewItems(NAME, NOUN, config.questions.length, LEAST_QUESTIONS),
      );
    }

    issues.push(...firstBlankItem(NAME, NOUN, config.questions));
    return issues;
  },

  validateAnswer(config, answer) {
    if (answer.answers.length !== config.questions.length) {
      return [answerCountMismatch(NAME, NOUN)];
    }

    return answer.answers.some((one) => one.trim() === "")
      ? [
          answerEmpty(
            NAME,
            "Scrie răspunsul așteptat pentru fiecare întrebare.",
          ),
        ]
      : [];
  },

  /**
   * Numbered to match the questions on the paper, blanks included.
   *
   * A row printed as a bare "3." is how the barem admits the third answer was
   * never written. Dropping it would renumber everything below and put the
   * marker's fourth answer against the pupil's third question.
   */
  describeAnswer(_config, answer) {
    return answer.answers
      .map((text, index) => `${positionMarker(index)} ${text.trim()}`.trim())
      .join("  ");
  },

  /**
   * A model answer matched literally is a FLOOR, not the marking.
   *
   * "Pentru că îi era foame" and "fiindcă îi era foame" are the same answer and
   * only one of them is in the barem, so this counts the ones that happen to
   * coincide and no more. What else to accept is written on the barem in the
   * teacher's own words, and it is a person who applies it. Reporting the
   * fraction that matched exactly is useful and honest; calling it the mark
   * would fail half a class for choosing different words.
   */
  score(_config, key, response) {
    const written = stringsFrom(response);
    if (written === null) return unanswered();

    return proportional(
      countMatching(
        key.answers,
        written,
        (expected, given) =>
          typeof given === "string" && matchesAccepted([expected], given),
      ),
      countOf(key.answers),
    );
  },
};
