import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "@ludicon/ui";

import { ClerkGate } from "./auth/clerk-gate";
import { UNGUARDED_SESSION } from "./auth/session";
import { isAuthConfigured } from "./lib/env";
import { createQueryClient } from "./lib/query-client";
import { createAppRouter } from "./router";
// Real font files, shipped as packages. The previous @font-face rules
// pointed at /fonts/*.woff2 that were never added, so every surface fell
// back to a system face.
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/source-serif-4";
import "@ludicon/ui/styles.css";
import "./styles/app.css";

const queryClient = createQueryClient();
const router = createAppRouter(queryClient);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

/**
 * Auth is mounted only when it is configured.
 *
 * `ClerkProvider` throws on a missing publishable key, so wrapping the tree
 * unconditionally would turn "no key in .env" into a blank screen. The app has
 * to run for anyone who clones the repo; identity is an addition to that, not
 * a precondition for it. `isAuthConfigured` is decided once at module load, so
 * this branch never flips mid-session and the two subtrees can never trade
 * hook order.
 *
 * The unguarded branch mounts the router directly with a `disabled` session,
 * which every route guard reads as "do not ask" — the app stays completely
 * usable with no key present.
 */
function App() {
  if (!isAuthConfigured) {
    return (
      <RouterProvider
        router={router}
        context={{ session: UNGUARDED_SESSION }}
      />
    );
  }
  return <ClerkGate router={router} />;
}

/**
 * `ThemeProvider` sits above the auth gate, not below it.
 *
 * Clerk's components paint their own surfaces and have to be handed the
 * resolved theme through `ClerkProvider`'s `appearance` prop. Reading that
 * requires `useTheme()` to be available *above* `ClerkProvider`, which it was
 * not while the theme lived inside it.
 */
createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
