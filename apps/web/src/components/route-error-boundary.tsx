import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

/**
 * Route-level error boundary.
 *
 * Copy follows the product's error rules: explain what happened, reassure that
 * work is safe, offer the next step. Never blame, never surface a stack trace
 * or an error code to the teacher. The technical detail is available in dev
 * only, behind a disclosure.
 */
export function RouteErrorBoundary({ error, reset }: ErrorComponentProps) {
  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <h1 className="font-display text-2xl text-foreground">
        Ceva a întrerupt lucrul
      </h1>
      <p className="max-w-prose text-muted-foreground">
        Ce ai lucrat este în siguranță. Poți încerca din nou sau te poți
        întoarce la biroul tău.
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-[--motion-fast] hover:bg-primary-hover"
        >
          Încearcă din nou
        </button>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-muted-foreground transition-colors duration-[--motion-fast] hover:text-foreground"
        >
          Înapoi la biroul meu
        </Link>
      </div>

      {import.meta.env.DEV && (
        <details className="mt-6 max-w-2xl text-left">
          <summary className="cursor-pointer text-sm text-subtle">
            Detalii tehnice (doar în dezvoltare)
          </summary>
          <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-4 font-mono text-xs text-muted-foreground">
            {error instanceof Error
              ? (error.stack ?? error.message)
              : String(error)}
          </pre>
        </details>
      )}
    </div>
  );
}
