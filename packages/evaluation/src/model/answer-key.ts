import { z } from "zod";
import { BlockId } from "./identifiers.js";
import { InlineContent } from "./inline.js";

/**
 * The barem — the answer key, keyed by the EXERCISE BLOCK'S OWN ID.
 *
 * Keying by block id rather than by question number is what makes the key
 * survive editing. Question numbers are derived from position, so inserting an
 * exercise at the top renumbers everything below it; a key keyed by number
 * would then silently pair every answer with the wrong question, and nothing in
 * the document would look wrong until a class had been marked.
 *
 * The key is a sibling of the document rather than a field on each exercise
 * block for a printing reason: the paper and the barem are two separate
 * printouts, and the pupil must never receive the file that contains both. A
 * top-level record can be dropped in one step; answers scattered across blocks
 * would have to be stripped, and a stripping pass that misses one is a leak.
 */

export const AnswerEntry = z.object({
  blockId: BlockId,
  /**
   * Copied from the exercise block so the key can be validated, exported and
   * printed without resolving the block. `validateProject` is what keeps the
   * copy honest.
   */
  exerciseType: z.string().min(1).max(80),
  /**
   * The correct answer, in whatever shape the registry's `answerSchema` says.
   * Opaque here for the same reason `ExerciseBlock.config` is.
   */
  answer: z.unknown(),
  points: z.number().min(0).max(100).default(1),
  /**
   * Marking guidance in the teacher's own words — what else to accept, where to
   * award partial credit. Inline content, not a plain string, because a maths
   * barem needs formulae.
   */
  notes: InlineContent.default([]),
});
export type AnswerEntry = z.infer<typeof AnswerEntry>;

export const AnswerKey = z.record(BlockId, AnswerEntry);
export type AnswerKey = z.infer<typeof AnswerKey>;

export const answerFor = (
  key: AnswerKey,
  blockId: BlockId,
): AnswerEntry | undefined => key[blockId];

/**
 * The barem total.
 *
 * Read off the answer key, not off the blocks: the key is the marker's
 * document, and a total that disagreed with what the marker is adding up would
 * be worse than no total. `validateProject` reports the disagreement instead of
 * either side quietly winning.
 */
export const answerKeyPoints = (key: AnswerKey): number =>
  Object.values(key).reduce((sum, entry) => sum + entry.points, 0);
