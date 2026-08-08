import { SectionHeader } from "@ludicon/ui";

import { AUTHORITY_POINTS, LANDING_COPY } from "./copy";

const { authority } = LANDING_COPY;

/**
 * The limits, stated before anyone asks.
 *
 * A teacher's first honest question about a product like this is "what will it
 * do behind my back?", and the answer is more persuasive than any feature list.
 * So the page spends a whole section on the three things that never happen,
 * written as commitments rather than as small print.
 *
 * The closing line names what the product is not. Ruling out the three things a
 * Romanian primary teacher has already been sold — a management platform, a
 * lesson vending machine, a chat window — is faster than describing the fourth
 * thing from scratch.
 */
export function TeacherAuthority() {
  return (
    <section
      aria-labelledby="cine-decide"
      className="reading-column px-6 tablet:px-8"
    >
      <SectionHeader
        id="cine-decide"
        title={authority.heading}
        supporting={authority.supporting}
      />

      {/* Three across only once there is room for it. At the tablet
          breakpoint these columns fell to roughly 24 characters a line — a
          paragraph set that narrow is a column of fragments, so the cards stack
          and keep their measure until a laptop width can afford the row. */}
      <ul className="mt-6 grid gap-3 laptop:grid-cols-3">
        {AUTHORITY_POINTS.map((point) => (
          <li
            key={point.title}
            className="flex flex-col gap-2 rounded-md border border-border bg-card p-5"
          >
            <h3 className="text-base leading-[1.4] font-semibold text-strong">
              {point.title}
            </h3>
            <p className="text-base leading-[1.6] text-muted-foreground">
              {point.body}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-[68ch] text-base leading-[1.6] text-muted-foreground">
        {authority.closing}
      </p>
    </section>
  );
}
