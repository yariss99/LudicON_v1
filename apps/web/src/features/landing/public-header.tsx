import { Link } from "@tanstack/react-router";
import { Button, PrimaMark, ThemeToggle } from "@ludicon/ui";

import { LANDING_COPY } from "./copy";

/**
 * The public chrome: a name, a way to change the light, a way back in.
 *
 * Deliberately not sticky. A bar that follows you down the page is a habit
 * borrowed from products that are worried you will leave; this one trusts the
 * page to hold the reader, and the hero carries the door.
 *
 * `Intră în cont` is ghost, not filled. A returning teacher needs it in the
 * corner where they expect it, but the page is allowed exactly one filled
 * action and the hero spends it — two blue buttons four inches apart is the
 * same sentence shouted twice.
 */
export function PublicHeader() {
  return (
    <header className="border-b border-border">
      <div className="reading-column flex min-h-16 items-center justify-between gap-4 px-6 py-3 tablet:px-8">
        <span className="flex items-center gap-2.5">
          <PrimaMark size={28} decorative />
          <span className="text-base leading-none font-semibold text-strong">
            {LANDING_COPY.brand}
          </span>
        </span>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="cursor-pointer" asChild>
            <Link to="/sign-in">{LANDING_COPY.header.signIn}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
