import { Link } from "@tanstack/react-router";
import { Button, PrimaMark } from "@ludicon/ui";

import { LANDING_COPY } from "./copy";

const { hero } = LANDING_COPY;

/**
 * One claim, one paragraph, one door.
 *
 * The headline is the product's whole argument and it is stated as a sequence
 * rather than a benefit: design first, materials after your approval. A teacher
 * who reads nothing else knows what separates this from every tool that offers
 * to write their lesson while they wait.
 *
 * No screenshot, no illustration, no floating device mock. The hero is set like
 * the first page of a book because that is what the product is trying to be —
 * a studio, not a storefront. Air does the work an image would have done badly.
 */
export function LandingHero() {
  return (
    <section className="reading-column px-6 pt-14 pb-12 tablet:px-8 tablet:pt-20 tablet:pb-16">
      <p className="text-sm leading-[1.5] font-medium text-muted-foreground">
        {hero.eyebrow}
      </p>

      <h1 className="mt-4 font-display text-[2rem] leading-[1.15] font-semibold text-strong tablet:text-[2.5rem] laptop:text-[3rem]">
        {hero.title}
      </h1>

      <p className="mt-6 max-w-[58ch] text-lg leading-[1.6] text-muted-foreground">
        {hero.lead}
      </p>

      {/* The page's single filled action. Everything else routing to the same
          place is a text link, so there is never a question about where the
          eye is being sent. */}
      <Button
        variant="primary"
        size="lg"
        className="mt-8 cursor-pointer"
        asChild
      >
        <Link to="/sign-in">{hero.primaryAction}</Link>
      </Button>

      <div className="mt-5 flex flex-wrap items-center gap-x-2">
        <span className="text-base leading-[1.5] text-muted-foreground">
          {hero.secondaryLead}
        </span>
        {/* Underlined at rest, not only on hover: colour alone is never allowed
            to be the thing that marks a link. */}
        <Button
          variant="link"
          size="md"
          className="cursor-pointer underline"
          asChild
        >
          <Link to="/sign-up">{hero.secondaryAction}</Link>
        </Button>
      </div>

      <p className="mt-8 flex items-start gap-2.5 text-base leading-[1.5] text-muted-foreground">
        <PrimaMark size={20} decorative className="mt-0.5" />
        {hero.assurance}
      </p>
    </section>
  );
}
