import { isAuthConfigured } from "../../lib/env";
import { ClerkAuthControl } from "./clerk-auth-control";
import { ProfileMenu } from "./profile-menu";

export interface AuthControlProps {
  onOpenPalette: () => void;
  /** `top` in the rail's footer, `bottom` in the compact bar. */
  side?: "top" | "bottom";
  /** Avatar-only, for the floating dock's row of round controls. */
  compact?: boolean;
  className?: string;
}

/**
 * One slot, two worlds.
 *
 * `isAuthConfigured` is a module constant derived from the validated
 * environment, so this branch is decided once at load and never flips during a
 * session — the two subtrees can therefore never trade hook order.
 *
 * Degrading rather than failing is the point: a contributor who clones the
 * repo without a Clerk key still gets a working shell with a real profile
 * menu, not a blank corner and a console full of provider errors.
 */
export function AuthControl({
  onOpenPalette,
  side = "bottom",
  compact = false,
  className,
}: AuthControlProps) {
  // Clerk's own `UserButton` is already a bare avatar and its signed-out form
  // is a labelled action that must keep its word, so `compact` has nothing to
  // change on this branch.
  if (isAuthConfigured) {
    return <ClerkAuthControl className={className} />;
  }
  return (
    <ProfileMenu
      onOpenPalette={onOpenPalette}
      side={side}
      compact={compact}
      className={className}
    />
  );
}
