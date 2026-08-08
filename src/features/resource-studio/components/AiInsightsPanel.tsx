/**
 * Reserved panel for future intelligent resource features.
 */
export function AiInsightsPanel() {
  return (
    <aside className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900">
        AI Insights
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Coming soon — the library will suggest tags, spot duplicates, and
        recommend resources to reuse across lessons, worksheets, assessments,
        and presentations.
      </p>
      <ul className="mt-4 space-y-2 text-xs text-slate-400">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          Semantic tagging
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          Duplicate detection
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          Reuse suggestions
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          Resource recommendations
        </li>
      </ul>
    </aside>
  );
}
