function Bone({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--atelier-radius)] bg-[var(--atelier-muted)] ${className}`}
      aria-hidden
    />
  );
}

function SkeletonWorkspace() {
  return (
    <div
      className="space-y-20"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Se încarcă Atelierul Profesorului"
    >
      <div className="space-y-3">
        <Bone className="h-3 w-36" />
        <Bone className="h-8 w-2/3 max-w-sm" />
        <Bone className="h-4 w-48" />
      </div>

      <div className="atelier-grid-actions">
        <Bone className="h-44" />
        <Bone className="h-44" />
        <Bone className="h-44" />
        <Bone className="h-44" />
      </div>

      <div className="space-y-6">
        <Bone className="h-4 w-52" />
        <div className="atelier-grid-lessons">
          <Bone className="h-56" />
          <Bone className="h-56" />
          <Bone className="h-56" />
        </div>
      </div>

      <div className="space-y-6">
        <Bone className="h-4 w-44" />
        <div className="atelier-recs-layout">
          <Bone className="h-64" />
          <div className="atelier-recs-secondary">
            <Bone className="h-44" />
            <Bone className="h-44" />
          </div>
        </div>
      </div>

      <div className="atelier-grid-stats">
        <Bone className="h-36" />
        <Bone className="h-36" />
        <Bone className="h-36" />
        <Bone className="h-36" />
      </div>

      <span className="sr-only">Se încarcă Atelierul Profesorului…</span>
    </div>
  );
}

export default SkeletonWorkspace;
