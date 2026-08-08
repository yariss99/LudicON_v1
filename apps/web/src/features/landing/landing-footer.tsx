import { PrimaMark } from "@ludicon/ui";

import { LANDING_COPY } from "./copy";

/**
 * A name and a sentence.
 *
 * No link farm, no newsletter box, no invented social accounts. A footer full
 * of dead links is a promise the product has not made yet, and this page would
 * rather end quietly than end wide.
 */
export function LandingFooter() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="reading-column flex flex-col gap-3 px-6 py-8 tablet:flex-row tablet:items-center tablet:justify-between tablet:px-8">
        <span className="flex items-center gap-2.5">
          <PrimaMark size={20} decorative />
          <span className="text-base leading-none font-semibold text-strong">
            {LANDING_COPY.brand}
          </span>
        </span>

        <p className="max-w-[62ch] text-sm leading-[1.5] text-muted-foreground">
          {LANDING_COPY.footer.tagline}
        </p>
      </div>
    </footer>
  );
}
