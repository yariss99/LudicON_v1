import { DISCIPLINE_LABEL, GRADE_LEVEL_LABEL } from "@ludicon/domain";
import {
  exerciseBlocks,
  pagesInOrder,
  type EvaluationProject,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../features/evaluation/copy";

/**
 * How a paper reads to a teacher, in one place.
 *
 * Three surfaces show the same paper — the list, the desk's continue row and
 * the rail's recents — and before this file they showed a `Project` from
 * `@ludicon/domain` instead: a record the web app no longer writes, whose id
 * cannot open the builder. Everything below reads the paper's own fields, and
 * every one of those fields can legitimately be absent, which is the reason
 * this is a module rather than three template literals.
 *
 * `meta.title`, `meta.discipline` and `meta.grade` are all optional in the model
 * on purpose — see `packages/evaluation/src/model/project.ts`: a teacher opens a
 * blank paper and starts typing questions, and the product does not gate that on
 * filling in a form. So the presentation layer is where "not answered yet" gets
 * words, and it must never render the enum id: `clasa_4` is a database key, and
 * putting one in front of a teacher is a live bug elsewhere in this app.
 */

/** The teacher's own title, or the same fallback the builder's own header uses. */
export const paperTitle = (paper: EvaluationProject): string =>
  paper.meta.title.trim() === "" ? EVALUATION_COPY.untitled : paper.meta.title;

/**
 * Romanian plurals, which are not "add an s".
 *
 * One takes the singular with no numeral at all — "o pagină", not "1 pagină" —
 * and from twenty upwards the numeral needs "de" in front of the noun. Getting
 * this wrong is the kind of thing that makes a product read as translated.
 */
export function countLabel(
  count: number,
  one: string,
  few: string,
  article = "o",
): string {
  if (count === 1) return `${article} ${one}`;
  const remainder = count % 100;
  return remainder >= 1 && remainder <= 19
    ? `${count} ${few}`
    : `${count} de ${few}`;
}

/**
 * "Matematică · Clasa a IV-a" — the line under every paper title.
 *
 * Either half can be missing and the separator goes with it, so a paper with
 * only a discipline reads as a discipline rather than as "Matematică · ".
 */
export function paperContext(paper: EvaluationProject): string {
  const parts = [
    paper.meta.discipline === null
      ? null
      : DISCIPLINE_LABEL[paper.meta.discipline],
    paper.meta.grade === null ? null : GRADE_LEVEL_LABEL[paper.meta.grade],
  ].filter((part): part is string => part !== null);

  return parts.length === 0 ? "Fără disciplină aleasă" : parts.join(" · ");
}

/**
 * "2 pagini · 3 exerciții" — what is actually on the paper.
 *
 * This replaces a status chip, and the replacement is the point. The old card
 * showed a phase from the lesson-planning loop (`discovery`, `approved`,
 * `published`); a paper has no such loop and inventing one would put a badge on
 * screen that changes for reasons the teacher cannot see. What a paper does have
 * is a size, read straight off the document, and "how far did I get" is the
 * question a list of half-written evaluations actually gets asked.
 *
 * The exercise count is dropped rather than shown as zero: a paper with no
 * questions yet is the normal state five minutes after creating one, and "0
 * exerciții" reads as a reproach.
 */
export function paperShape(paper: EvaluationProject): string {
  const pages = countLabel(pagesInOrder(paper).length, "pagină", "pagini");
  const exercises = exerciseBlocks(paper).length;

  return exercises === 0
    ? pages
    : `${pages} · ${countLabel(exercises, "exercițiu", "exerciții", "un")}`;
}

const RELATIVE_TIME = new Intl.RelativeTimeFormat("ro", { numeric: "auto" });

/**
 * "acum 20 de minute", "ieri", "acum 3 zile".
 *
 * A teacher asks "when did I last touch this", not "at what instant". Past
 * four weeks the answer stops being useful as a countdown, so it becomes a
 * date instead of "acum 63 de zile".
 */
const DAY_MONTH = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
});

export function relativeUpdated(iso: string): string {
  const instant = new Date(iso).getTime();
  if (Number.isNaN(instant)) return "";

  const minutes = Math.round((instant - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return RELATIVE_TIME.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return RELATIVE_TIME.format(hours, "hour");

  const days = Math.round(hours / 24);
  if (Math.abs(days) <= 28) return RELATIVE_TIME.format(days, "day");

  return DAY_MONTH.format(new Date(iso));
}
