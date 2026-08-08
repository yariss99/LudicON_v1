/**
 * How a position is written down, in the one place both halves can reach.
 *
 * "a)" beside an option on the printed page and "a) Bucureşti" on the barem are
 * the same string produced twice — once by a renderer in the app and once by
 * `describeAnswer` in this package, which has no DOM and cannot call the
 * renderer's copy. Two implementations of "which letter is index 3" is exactly
 * how a marking sheet ends up saying "c)" for the option a pupil sees as "d)",
 * and that is a whole class marked wrongly with nothing on either sheet looking
 * out of place.
 *
 * So the arithmetic lives here, in the DOM-free half, and the app's `paper.tsx`
 * calls it rather than repeating it. The rejected alternative — passing the
 * formatted label into `describeAnswer` — would mean the barem could only be
 * built by something that had already rendered the paper, which the PDF worker
 * and the API both need not to be true.
 */

export type OptionMarkerStyle = "letters" | "numbers" | "none";

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/**
 * The label printed beside an option.
 *
 * Letters from clasa a III-a, numbers before that — the convention is about
 * whether the alphabet is something the class already has, not about taste.
 *
 * Past the twenty-sixth option the letter would wrap round to "a" and mark two
 * options the same, so it falls back to the number. No Romanian evaluation
 * question has twenty-seven options; silently duplicating a label would be far
 * worse than an unexpected digit if one ever did.
 */
export const optionMarker = (
  index: number,
  style: OptionMarkerStyle,
): string => {
  if (style === "none") return "";
  if (style === "numbers") return `${index + 1}.`;
  const letter = LETTERS[index];
  return letter === undefined ? `${index + 1}.` : `${letter})`;
};

/** A place in a sequence, where the teacher counts rather than letters. */
export const positionMarker = (index: number): string => `${index + 1}.`;

/**
 * An option as it reads on a barem: its label, then its text.
 *
 * Falls back to the label alone when the option is blank or gone, because a
 * barem row saying "b)" is honest about a half-written question, whereas an
 * empty string reads as "the answer is nothing" — which for a fill-in exercise
 * is a plausible answer and therefore a dangerous one.
 */
export const describeOption = (
  options: readonly string[],
  index: number,
  style: OptionMarkerStyle,
): string => {
  const marker = optionMarker(index, style);
  const option = options[index];
  return option === undefined || option.trim() === ""
    ? marker
    : `${marker} ${option.trim()}`.trim();
};
