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
 * An image to look at, then questions about what is in it.
 *
 * ## `alt` is required the moment there is an image, and it is not a courtesy
 *
 * A picture the pupil cannot see is a question with no stem. That is true for a
 * pupil using a screen reader, and it is equally true of the photocopier the
 * paper actually goes through: a colour photograph reproduced in grey at the
 * third generation is frequently unreadable, and the description is what the
 * teacher reads out to the class instead. So `validate` blocks on a missing
 * description whenever a `src` is set — not as an accessibility box to tick,
 * but because the exercise does not work without it on paper either.
 *
 * ## The height is stored, the width is not
 *
 * `heightMm` fixes how much vertical room the picture takes, because that is
 * what the paginator needs and what the teacher is actually rationing on an A4
 * sheet. The width follows the column the exercise sits in, and the renderer
 * fits the image inside that box without cropping. Storing both was rejected:
 * the same exercise sits in a full-width row on one page and a third of a row
 * on another, so a stored width would be wrong on one of them, and the pair
 * would let a teacher set an aspect ratio that squashes a photograph.
 *
 * ## `answers` is positional, so its length is load-bearing
 *
 * The barem is a list parallel to `questions` — the third answer belongs to the
 * third question because of where it sits. `validateAnswer` therefore refuses a
 * length mismatch outright rather than marking what it can: a barem shifted by
 * one is not partly right, and every row after the gap still looks plausible.
 */

const NAME = "Observă imaginea";
const NOUN: ItemNoun = { one: "întrebarea", many: "întrebări" };
const LEAST_QUESTIONS = 1;

export const ImageObservationConfig = z.object({
  src: z.string().max(4000).default(""),
  /** What is in the picture, for the pupil who cannot see it. */
  alt: z.string().max(500).default(""),
  /** How much vertical room the picture takes on the sheet. */
  heightMm: z.number().min(20).max(160).default(55),
  questions: z.array(z.string().max(300)).max(6).default([]),
  /** Ruled lines printed under each question. */
  linesPerQuestion: z.number().int().min(1).max(6).default(2),
});
export type ImageObservationConfig = z.infer<typeof ImageObservationConfig>;

export const ImageObservationAnswer = z.object({
  /** One model answer per question, in the questions' own order. */
  answers: z.array(z.string().max(500)).max(6),
});
export type ImageObservationAnswer = z.infer<typeof ImageObservationAnswer>;

export const imageObservationExercise: ExerciseDefinition<
  ImageObservationConfig,
  ImageObservationAnswer
> = {
  type: "image-observation",
  category: "observation",

  labels: {
    name: NAME,
    description:
      "Elevul se uită la o imagine și răspunde la întrebări despre ea.",
    keywords: [
      "observa",
      "imagine",
      "poza",
      "desen",
      "priveste",
      "ce vezi",
      "observare",
      "stiinte",
    ],
  },

  configSchema: ImageObservationConfig,
  answerSchema: ImageObservationAnswer,

  /**
   * One empty question, and 55mm of reserved height.
   *
   * One rather than two, because an observation exercise often asks a single
   * open question — "ce anotimp este și de unde știi?" — where a reading text
   * almost always asks several. 55mm is about a third of the writing area on
   * A4: large enough to make out detail after photocopying, small enough that
   * the questions still fit under it.
   */
  defaults: {
    src: "",
    alt: "",
    heightMm: 55,
    questions: [""],
    linesPerQuestion: 2,
  },

  layouts: [
    exerciseLayout("standard", 70),
    exerciseLayout("two-column", 60),
    exerciseLayout("card", 76),
  ],

  validate(config) {
    const issues: ValidationIssue[] = [];

    if (config.src.trim() === "") {
      issues.push(
        textMissing(
          NAME,
          "imaginea",
          "Pune adresa imaginii pe care o privesc elevii.",
        ),
      );
    } else if (config.alt.trim() === "") {
      /* Only once there is a picture: an exercise with neither is unfinished in
         one way, and saying so twice buries the step the teacher takes first. */
      issues.push(
        textMissing(
          NAME,
          "descrierea imaginii",
          "Scrie ce se vede în imagine — pentru elevii care ascultă pagina și pentru tipar.",
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
   * What a pupil notices in a picture is open by design — "e toamnă" and
   * "frunzele sunt galbene" can both be right about the same photograph — so
   * this counts only the ones that happen to coincide with the barem's wording.
   * What else to accept is written on the barem in the teacher's own words, and
   * it is a person who applies it.
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
