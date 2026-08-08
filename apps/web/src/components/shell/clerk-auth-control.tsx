import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/clerk-react";
import { LogIn } from "lucide-react";
import { Button, cn } from "@ludicon/ui";

export interface ClerkAuthControlProps {
  className?: string;
}

/**
 * The identity control when a publishable key is configured.
 *
 * Kept in its own module because everything in it requires a `ClerkProvider`
 * above it in the tree. `AuthControl` decides which of the two exists; nothing
 * here is rendered unless `isAuthConfigured` is true, so the app still boots
 * with no key at all.
 *
 * Appearance used to sit here as a peer button, because Clerk's `UserButton`
 * owns its own menu and this app cannot add rows to it. It has moved out to
 * `AppearanceMenu`, which both auth branches now render identically — the
 * previous arrangement meant the fallback branch hid the theme in a submenu
 * while this one exposed it, for no reason a teacher could have known.
 *
 * `Conectează-te` is `primary`. When nobody is signed in it is the only action
 * on the page that leads anywhere, and the owner's rule is that an action reads
 * as one.
 *
 * It keeps its word in every container. There used to be an icon-only form for
 * the 72px rail, and the rail is no longer where identity lives — the dock is,
 * and the dock only exists from 900px up, where there is room. A lone arrow
 * glyph is a poor way to ask someone to sign in to the place next term's
 * lessons are kept.
 *
 * `mode="redirect"` sends the teacher to the `/sign-in` page rather than
 * opening a dialog over the studio. It is Clerk's default, but it is written
 * out because this used to be `mode="modal"` and the difference is a product
 * decision, not a default worth inheriting silently: signing in to the place
 * next term's lessons live is not a small interruption to be dismissed by
 * clicking beside it.
 *
 * Where it goes is Clerk's `signInUrl`, set once on the provider in
 * `auth/clerk-gate.tsx`. That indirection is deliberate — the same setting is
 * what stops Clerk falling back to its hosted Account Portal — and it means
 * this file never names a route.
 */
export function ClerkAuthControl({ className }: ClerkAuthControlProps) {
  return (
    <div className={cn("flex min-w-0 items-center", className)}>
      {/* The wrapper reserves the same 44px box the bell and the appearance
          control occupy, so the cluster's spacing is decided by the shell and
          not by whatever Clerk renders inside it. It draws nothing itself:
          hover, open and focus all belong to Clerk's own trigger.

          The margin exists because Clerk's button is left in its own styling,
          and what it draws is wider than the photo — the open-state ring sits
          outside the avatar, so a box sized to the disc leaves the ring
          crowding its neighbour. `ml` opens that gap. It is margin rather than
          a bigger box on purpose: the box still measures 44px, so the row's
          rhythm is unchanged.

          There is deliberately no right margin. One was needed while these
          controls lived in a rounded island whose only clearance was a 6px
          inset; the bar's `px-6 tablet:px-8` gutter is more than the ring can
          use, and a right margin there would just stop the last control short
          of the edge the page content lines up on. */}
      <SignedIn>
        <span className="ml-1 inline-flex size-11 shrink-0 items-center justify-center">
          <UserButton />
        </span>
      </SignedIn>
      <SignedOut>
        <SignInButton mode="redirect">
          <Button variant="primary" size="sm" className="min-w-0">
            <LogIn aria-hidden strokeWidth={1.75} />
            <span className="truncate">Conectează-te</span>
          </Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}
