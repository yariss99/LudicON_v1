/**
 * Route loading state.
 *
 * Skeletons that match the final layout, never an indeterminate spinner on a
 * whole page and never fake progress. The label is educational Romanian rather
 * than a bare "Loading…", per the product's loading rules.
 */
export function RoutePending() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="shell-column w-full px-6 py-10"
    >
      <span className="sr-only">Se încarcă…</span>
      <div className="space-y-6">
        <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 tablet:grid-cols-3">
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
          <div className="h-40 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
