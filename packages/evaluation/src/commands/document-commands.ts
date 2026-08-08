import type { AnswerEntry } from "../model/answer-key.js";
import type { BlockId } from "../model/identifiers.js";
import type { PageSetup } from "../model/page.js";
import type { EvaluationMeta } from "../model/project.js";
import type { Theme } from "../theme/theme.js";
import { withEntry, withoutEntry } from "./collections.js";
import { unchanged, type Command } from "./types.js";

/**
 * Document-level commands: the theme, the metadata, the page setup and the
 * answer key.
 *
 * `setMeta` takes a PARTIAL patch but returns an inverse carrying the WHOLE
 * previous metadata. That asymmetry is on purpose. A partial patch is what the
 * caller has — a title field fired a change event, nothing else moved — while a
 * partial inverse would have to distinguish "this key was absent" from "this
 * key was present and undefined", which is the bug class that makes undo
 * restore `undefined` over a value. The whole object is six small fields; the
 * ambiguity is not worth saving them.
 */

export const setMeta = (patch: Partial<EvaluationMeta>): Command => {
  const label = "Modifică detaliile lucrării";
  return {
    label,
    apply: (document) => {
      const previous = document.meta;
      const next: EvaluationMeta = {
        title: patch.title ?? previous.title,
        description: patch.description ?? previous.description,
        discipline:
          patch.discipline === undefined
            ? previous.discipline
            : patch.discipline,
        grade: patch.grade === undefined ? previous.grade : patch.grade,
        durationMinutes: patch.durationMinutes ?? previous.durationMinutes,
        author: patch.author === undefined ? previous.author : patch.author,
      };

      return {
        next: { ...document, meta: next },
        inverse: setMeta(previous),
      };
    },
  };
};

/**
 * Swaps the whole token set.
 *
 * Re-theming works only because blocks store token names rather than hex — see
 * `../theme/color.ts`. A block that opted out with a literal colour keeps it,
 * which is what opting out means.
 */
export const setTheme = (theme: Theme): Command => {
  const label = "Schimbă tema";
  return {
    label,
    apply: (document) => ({
      next: { ...document, theme },
      inverse: setTheme(document.theme),
    }),
  };
};

export const setPageSetup = (setup: PageSetup): Command => {
  const label = "Modifică formatul paginii";
  return {
    label,
    apply: (document) => ({
      next: { ...document, pageSetup: setup },
      inverse: setPageSetup(document.pageSetup),
    }),
  };
};

/**
 * Writes or clears one barem entry.
 *
 * `null` clears, and the inverse of clearing is writing the captured entry
 * back. A separate `removeAnswer` command was the rejected alternative: it
 * would have needed its own inverse and its own guard for "there was nothing
 * there", both of which fall out of this one signature for free.
 */
export const setAnswer = (
  blockId: BlockId,
  entry: AnswerEntry | null,
): Command => {
  const label = "Modifică baremul";
  return {
    label,
    apply: (document) => {
      const previous = document.answerKey[blockId] ?? null;
      if (previous === null && entry === null) {
        return unchanged(document, label);
      }

      return {
        next: {
          ...document,
          answerKey:
            entry === null
              ? withoutEntry(document.answerKey, blockId)
              : withEntry(document.answerKey, blockId, entry),
        },
        inverse: setAnswer(blockId, previous),
      };
    },
  };
};
