/**
 * Reserved panel for future competency mastery, gaps, and follow-up resources.
 */
export function LearningInsightsPanel() {
  return (
    <aside className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900">
        Learning Insights
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Coming soon — competency mastery, learning gaps, and recommended
        follow-up resources will appear here after students complete this
        assessment.
      </p>
      <ul className="mt-4 space-y-2 text-xs text-slate-400">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          Competency mastery overview
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          Learning gaps
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          Recommended follow-up resources
        </li>
      </ul>
    </aside>
  );
}
