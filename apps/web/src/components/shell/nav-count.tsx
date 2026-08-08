import { cn } from "@ludicon/ui";

export interface NavCountProps {
  count: number;
  /** The row this chip sits on is the current page. */
  onActiveRow: boolean;
}

/** Romanian pluralisation is irregular past 19, so the chip caps rather than lies. */
export function navCountLabel(count: number): string {
  return count > 99 ? "99+" : String(count);
}

/**
 * The live number on a destination.
 *
 * It used to be a tinted patch: `--muted` on a `--surface` row measured 1.17:1
 * in dark and 1.06:1 in light, and on the *active* row — where the fill is
 * `--primary-soft` — it fell to 1.06:1. A chip has to be an object sitting on
 * the row; at those values it was a slightly different shade of the row, which
 * is why it read as a smudge rather than as a count.
 *
 * Soft tokens cannot fix that here. The rail is `--surface`, which is plain
 * white in light mode, and every `*-soft` fill in the system is a near-white
 * tint by design — they are the 50 step of their own ramp. Any of them lands
 * within 1.1:1 of the row. The only fill that separates is a
 * solid one, so the chip is solid and the numeral is punched out of it. Both
 * tones clear 3:1 as a shape and 4.5:1 as text, in both themes and on both row
 * states — measured, not estimated.
 *
 * Two tones, and neither of them is a status:
 *
 *   quantity  `--text-subtle` — how much you have. Grey, because an inventory
 *             should not compete with anything.
 *   active    `--primary` — the same blue the row's label, marker bar and
 *             current-page state are already speaking in. On the row you are
 *             standing on, the chip inverts into that language instead of
 *             staying a foreign grey patch inside a blue-tinted row.
 *
 * There was a third tone, `--accent` filled with `--accent-foreground`, for the
 * unread count. It is gone. `--accent` is amber-600, a burnt orange that reads
 * as red at chip scale, and `--accent-foreground` on it is near-black: the
 * pairing is hazard tape. The
 * amber-rather-than-red decision was made precisely so a teacher's own quiet
 * progress would not look like an alarm, and that pairing defeated it at the
 * last step.
 *
 * The deeper point is that it should never have been a status. An unread count
 * is a quantity: nothing has gone wrong when six lessons have moved on. Amber
 * is the product's attention colour and spending it on "you have items" is how
 * it stops meaning anything when something genuinely needs attention. So every
 * count in the rail is now the same object, and the one place amber survives in
 * this shell is the 8px dot that answers a different question — "is there
 * anything new?" — on the bell and on the 72px rail's own bell glyph.
 *
 * None of this is colour-only. The chip is a number, and the number is the
 * message; the colour only says whether you are standing on this row.
 */
export function NavCount({ count, onActiveRow }: NavCountProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-6 shrink-0 items-center justify-center rounded-full px-1.5",
        // Tabular figures so 6, 12 and 34 are the same object at three
        // different values rather than three slightly different widths.
        "text-[0.75rem] leading-none font-semibold tabular-nums",
        onActiveRow
          ? "bg-primary text-primary-foreground"
          : "bg-subtle text-surface",
      )}
    >
      {navCountLabel(count)}
    </span>
  );
}
