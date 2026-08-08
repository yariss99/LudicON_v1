/**
 * The shell's icon-button shape, in one place.
 *
 * Five controls were repeating the same eleven utilities — the drawer trigger,
 * the compact search, the bell, the appearance control and the account glyph —
 * and they had already drifted: two carried `cursor-pointer`, three did not.
 * A shared constant is the difference between "they look the same" and "they
 * are the same".
 *
 * 44px is the floor CH07 sets for a touch target, and it is the diameter here
 * rather than a padded minimum so the hit area and the visible circle agree.
 */
export const SHELL_ICON_BUTTON = [
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full",
  "text-muted-foreground",
  "transition-colors duration-[var(--motion-fast)] ease-standard",
  "hover:bg-muted hover:text-foreground",
  "data-[state=open]:bg-muted data-[state=open]:text-foreground",
].join(" ");

/**
 * The mark inside that shape.
 *
 * The account control used to be the exception and it showed. It drew a 32px
 * ringed disc holding a 16px glyph inside the same 44px circle its neighbours
 * filled with a bare 20px one — so in a row of four controls, three were marks
 * and one was a smaller mark inside a ring inside a target, visibly floating
 * off its own border. There is no version of "roughly the same size" that
 * survives four of these sitting shoulder to shoulder in one island; the number
 * has to come from one place.
 *
 * 20px on a 24px Lucide viewBox, at 1.75 stroke, across one icon family. All
 * four glyphs are open stroked shapes of the same weight, so nominal size and
 * optical size agree here and no per-icon correction is needed. A filled or
 * enclosed mark would read heavier at the same bounds and would need one —
 * which is the other reason the account's disc had to go rather than shrink.
 */
export const SHELL_ICON_GLYPH = "size-5";
