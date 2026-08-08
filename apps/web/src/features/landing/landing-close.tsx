import { Link } from "@tanstack/react-router";
import { Button } from "@ludicon/ui";

import { LANDING_COPY } from "./copy";

const { close } = LANDING_COPY;

/**
 * The same door, at the point the reader has finished reading.
 *
 * It repeats the hero's action rather than inventing a new one. The two are
 * never on screen together, so the page still shows one filled control at a
 * time, and a teacher who scrolled to the end should not have to scroll back up
 * to act on what they just read.
 *
 * The heading asks for tomorrow's lesson specifically. "Get started" commits a
 * reader to a product; "start with tomorrow's lesson" commits them to one hour
 * of work they already owe.
 */
export function LandingClose() {
  return (
    <section
      aria-labelledby="incepe"
      className="reading-column px-6 tablet:px-8"
    >
      <div className="flex flex-col items-start border-t border-border pt-12 tablet:pt-16">
        <h2
          id="incepe"
          className="font-display text-[1.75rem] leading-[1.2] font-semibold text-strong tablet:text-[2rem]"
        >
          {close.heading}
        </h2>

        <p className="mt-3 max-w-[58ch] text-lg leading-[1.6] text-muted-foreground">
          {close.lead}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button
            variant="primary"
            size="lg"
            className="cursor-pointer"
            asChild
          >
            <Link to="/sign-in">{close.primaryAction}</Link>
          </Button>
          {/* Outlined, not ghost. A ghost button at this size is 56px of
              invisible box around a word — next to a filled control it reads as
              stray text rather than the second half of a choice. */}
          <Button
            variant="secondary"
            size="lg"
            className="cursor-pointer"
            asChild
          >
            <Link to="/sign-up">{close.secondaryAction}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
