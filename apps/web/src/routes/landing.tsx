import { createFileRoute } from "@tanstack/react-router";

import {
  LandingClose,
  LandingFooter,
  LandingHero,
  PublicHeader,
  TeacherAuthority,
  TeachingLoop,
} from "../features/landing";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
});

/**
 * The public page — what someone sees before there is an account.
 *
 * It lives at `/landing` rather than `/` because `_studio/index.tsx` already
 * claims the root path for the Teacher Desk. Who gets sent here is an auth
 * routing decision and belongs with whoever owns the guard on `_studio`, not
 * with this file; all this page promises is to be a complete, standalone
 * explanation of the product with one way in.
 *
 * Five sections and nothing more. A teacher deciding whether to trust a tool
 * with next Tuesday's lesson needs the claim, the sequence, the limits and a
 * door — everything past that is a page asking to be scrolled rather than read.
 *
 * `id="continut"` catches the skip link declared in `__root.tsx`; without it
 * the first thing a keyboard user does on the page silently fails.
 */
function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />

      <main id="continut" className="flex-1">
        <LandingHero />

        {/* Block flow, not flex. Every section centres itself with
            `margin-inline: auto`, and an auto cross-axis margin cancels a flex
            item's `stretch` — the sections silently shrink-wrapped their own
            text and drifted out of alignment with the hero above them. */}
        <div className="space-y-16 pb-4 tablet:space-y-20">
          <TeachingLoop />
          <TeacherAuthority />
          <LandingClose />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
