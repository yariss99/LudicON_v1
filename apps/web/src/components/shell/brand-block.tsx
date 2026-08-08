import { Link } from "@tanstack/react-router";
import { PrimaMark, cn } from "@ludicon/ui";

export interface BrandBlockProps {
  /** Icon-rail form: the mark alone, centred. */
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}

/**
 * The brand, and the shell's top-left anchor.
 *
 * It sits at exactly the header's height so the hairline under it continues
 * the header's bottom border across the full width of the shell — one
 * unbroken line rather than two that nearly meet.
 *
 * The wordmark is set in the display face because it is a name, not UI copy;
 * the descriptor below it stays in the UI face at caption scale so the pair
 * reads as one object instead of two competing sizes.
 *
 * The descriptor no longer truncates. It was clipping to "Atelierul pr…" at
 * the rail's own width — the brand, the first thing on the page, was rendering
 * broken. Tightening the gap and dropping the tracking on the wordmark buys
 * back the twenty pixels it needed.
 */
export function BrandBlock({
  collapsed = false,
  onNavigate,
  className,
}: BrandBlockProps) {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      aria-label="PRIMA — biroul meu"
      className={cn(
        "flex h-16 shrink-0 items-center rounded-sm",
        "transition-colors duration-[var(--motion-fast)] ease-standard",
        collapsed ? "justify-center px-2" : "gap-2.5 px-2",
        className,
      )}
    >
      <PrimaMark size={28} decorative className="shrink-0" />
      {collapsed ? null : (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-display text-[1.0625rem] leading-[1.2] font-semibold text-foreground">
            PRIMA
          </span>
          <span className="mt-1 text-[0.75rem] leading-[1.3] whitespace-nowrap text-muted-foreground">
            Atelierul profesorului
          </span>
        </span>
      )}
    </Link>
  );
}
