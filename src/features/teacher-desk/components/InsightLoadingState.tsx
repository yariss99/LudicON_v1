function InsightLoadingState() {
  return (
    <div
      className="flex flex-1 flex-col gap-4 py-2"
      role="status"
      aria-label="Pregătim sugestia didactică"
    >
      <div className="flex gap-2">
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-6 w-28 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="h-7 w-4/5 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-16 w-full animate-pulse rounded-2xl bg-slate-100" />
      <div className="mt-4 h-11 w-28 animate-pulse rounded-2xl bg-slate-100" />
      <span className="sr-only">Loading Teaching Insight…</span>
    </div>
  );
}

export default InsightLoadingState;
