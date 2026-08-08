import { Link } from "@tanstack/react-router";
import { Button, PrimaMark } from "@ludicon/ui";

/**
 * Romanian time-of-day greeting.
 *
 * Kept gender-neutral: the follow-up line is phrased without an adjective that
 * would have to agree, so the desk never has to guess.
 */
function greeting(hour: number): string {
  if (hour < 12) return "Bună dimineața";
  if (hour < 18) return "Bună ziua";
  return "Bună seara";
}

/**
 * The first thing a teacher sees, and deliberately almost the only thing.
 *
 * Greeting, one supporting line, one primary action. No counters, no KPI row,
 * no schedule widget — a teacher opening this at 7am does not need to be told
 * how many drafts they have, they need somewhere to start.
 *
 * PRIMA is present as a sentence rather than a panel. It is the product's name
 * and its promise, so it says what it does in one line and then gets out of the
 * way. The mark is decorative and at rest: it used to stir when the desk had a
 * suggestion waiting further down the page, and there are no suggestions any
 * more — they were derived from a lesson-planning phase a paper does not have.
 * A mark that animates for nothing is worse than one that does not animate.
 */
export function DeskHero() {
  return (
    <section className="flex flex-col items-start">
      {/* Heading left, action right on one row — the header pattern `Proiecte`
          uses, so the two pages a teacher lives on put their one action in the
          same place. `flex-wrap` with `items-start` lets the button drop below
          the greeting rather than crushing it on a narrow window, and `w-full`
          is what gives `justify-between` something to spread across inside a
          column that is otherwise `items-start`. */}
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.75rem] leading-tight font-semibold text-foreground tablet:text-[2rem]">
            {greeting(new Date().getHours())}.
          </h1>

          <p className="mt-2 text-lg leading-[1.5] text-muted-foreground">
            Cu ce dorești să lucrezi astăzi?
          </p>
        </div>

        {/* Filled. An earlier pass stepped this down to an outlined pill so it
            would not compete with the rail's `Creează`; the owner has reversed
            that, and on reflection the reversal is right. This is the one thing
            the desk asks a teacher to do, and a page's own call to action should
            not be quieter than the chrome around it. The rail's control is a
            menu of six things you could start; this is the sentence the page is
            making.

            `size="lg"` is gone with the move. Beside a heading it is a header
            action and it should measure like `Proiecte`'s, which is the default
            size; at the old full-width-below position it was the page's whole
            centre of gravity and earned the extra height. */}
        <Button variant="primary" asChild>
          <Link to="/create">Creează un proiect</Link>
        </Button>
      </div>

      <p className="mt-6 flex items-center gap-2.5 text-sm leading-[1.5] text-muted-foreground">
        <PrimaMark size={20} decorative className="shrink-0" />
        PRIMA ține evaluările tale la un loc, gata de tipărit.
      </p>
    </section>
  );
}
