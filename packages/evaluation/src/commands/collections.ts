/**
 * The immutable array and record primitives every command is built from.
 *
 * They live in one module because a command that spliced an array in place
 * would corrupt the previous document — and the previous document is exactly
 * what the undo history is holding a reference to. One accidental `splice`
 * anywhere in the command layer turns undo into a no-op that nobody can
 * reproduce, so the operations are written once, here, and nothing else in
 * `../commands` touches an array directly.
 *
 * `withoutEntry` deliberately rebuilds through `Object.entries` rather than
 * copying and `delete`-ing. Both are correct; the rebuild has no mutation step
 * at all, so there is no version of the code where the copy is skipped by
 * accident and the original record is edited.
 */

export const insertAt = <T>(
  list: readonly T[],
  index: number,
  value: T,
): T[] => {
  const at = clampIndex(index, list.length);
  return [...list.slice(0, at), value, ...list.slice(at)];
};

export const removeAt = <T>(list: readonly T[], index: number): T[] =>
  index < 0 || index >= list.length
    ? [...list]
    : [...list.slice(0, index), ...list.slice(index + 1)];

/**
 * Clamps an insertion index into `[0, length]`.
 *
 * Inclusive of `length` on purpose: appending is inserting at the end, and a
 * drop past the last item is the most common gesture in the editor.
 */
export const clampIndex = (index: number, length: number): number =>
  Math.max(0, Math.min(Math.trunc(index), length));

export const withEntry = <K extends string, V>(
  record: Readonly<Record<K, V>>,
  key: K,
  value: V,
): Record<K, V> => ({ ...record, [key]: value }) as Record<K, V>;

export const withEntries = <K extends string, V>(
  record: Readonly<Record<K, V>>,
  entries: Readonly<Record<K, V>>,
): Record<K, V> => ({ ...record, ...entries });

export const withoutEntry = <K extends string, V>(
  record: Readonly<Record<K, V>>,
  key: K,
): Record<K, V> => withoutEntries(record, [key]);

export const withoutEntries = <K extends string, V>(
  record: Readonly<Record<K, V>>,
  keys: readonly K[],
): Record<K, V> => {
  const removed = new Set<string>(keys);
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => !removed.has(key)),
  ) as Record<K, V>;
};

/** The entries named by `keys` that actually exist. Used to capture undo state. */
export const pickEntries = <K extends string, V>(
  record: Readonly<Record<K, V>>,
  keys: readonly K[],
): Record<K, V> => {
  const wanted = new Set<string>(keys);
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => wanted.has(key)),
  ) as Record<K, V>;
};
