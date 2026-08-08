import type { ClerkProviderProps } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import type { ResolvedTheme } from "@ludicon/ui";

type ClerkAppearance = NonNullable<ClerkProviderProps["appearance"]>;

/**
 * The only tokens Clerk is shown.
 *
 * Every value is a `var(--token)` reference into the app's own semantic layer,
 * so Clerk's surfaces move with the theme for exactly the reason the app's do:
 * one custom property changes and everything downstream follows. No colour is
 * written here, so there is nothing to re-sync when the palette moves.
 *
 * `borderRadius` is the *small* token deliberately — Clerk treats the value as
 * its `md` base and scales larger elements up from it, so handing it the panel
 * radius would round the inputs like pills.
 */
const TOKEN_VARIABLES: NonNullable<ClerkAppearance["variables"]> = {
  colorPrimary: "var(--primary)",
  colorPrimaryForeground: "var(--primary-foreground)",
  colorBackground: "var(--surface)",
  colorForeground: "var(--foreground)",
  colorMuted: "var(--muted)",
  colorMutedForeground: "var(--muted-foreground)",
  colorInput: "var(--surface)",
  colorInputForeground: "var(--foreground)",
  colorBorder: "var(--border-strong)",
  colorDanger: "var(--destructive)",
  colorSuccess: "var(--success)",
  colorWarning: "var(--warning)",
  colorRing: "var(--ring)",
  fontFamily: "var(--font-sans)",
  fontFamilyButtons: "var(--font-sans)",
  borderRadius: "var(--radius-sm)",
};

/**
 * Clerk renders its own DOM inside its own stylesheet and knows nothing about
 * this app's `data-theme` attribute. Left alone it paints a light card onto a
 * dark page.
 *
 * Two layers fix that, and both are load-bearing.
 *
 * `theme` — the current name for what older versions called `baseTheme`, which
 * is deprecated in @clerk/clerk-react 5.61 — flips Clerk's own internal
 * light/dark decisions: shadows, dividers, the states its CSS derives rather
 * than reads. Nothing in `variables` can reach those.
 *
 * `variables` then pulls the brand back on top — typeface, radius, colour
 * roles — so the card reads as LudicON in either theme instead of as stock
 * Clerk wearing the wrong grey.
 */
/**
 * Theme and tokens only. Clerk styles its own controls.
 *
 * There is deliberately no `elements` override. The `UserButton`'s diameter and
 * its open-state ring were both overridden at one point, to make the avatar
 * measure like the icon buttons beside it in the dock; it kept looking wrong in
 * place, and the owner's call is that Clerk's own styling stands. The shell
 * gives the button room instead of instructions — `clerk-auth-control.tsx`
 * carries the margin that keeps it and its ring clear of the dock's rounded
 * end, and Clerk decides everything inside that box.
 *
 * Note for anyone who reaches for `elements` later: Clerk *appends* those
 * classes to its own rather than replacing them, and injects its stylesheet
 * after the bundle's, so equal-specificity utilities silently lose. That is not
 * a hypothetical — it is why an earlier pass here appeared to do nothing at
 * all. Anything added needs `!` on the colliding declarations.
 */

export function clerkAppearance(resolved: ResolvedTheme): ClerkAppearance {
  return {
    theme: resolved === "dark" ? dark : undefined,
    variables: TOKEN_VARIABLES,
  };
}
