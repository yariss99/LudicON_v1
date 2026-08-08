/**
 * Reserved AI Suggestions panel for narrative assistance.
 */
export function AiSuggestionsPanel() {
  return (
    <aside className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900">
        AI Suggestions
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Coming soon — smarter help for flow, vocabulary, suspense, and endings.
        Use Improve on each block for contextual drafts now.
      </p>
      <ul className="mt-4 space-y-2">
        {[
          "Improve narrative flow",
          "Adapt vocabulary",
          "Increase suspense",
          "Convert exercise into dialogue",
          "Suggest alternative ending",
        ].map((label) => (
          <li key={label}>
            <button
              type="button"
              disabled
              className="w-full rounded-xl border border-slate-100 bg-white/60 px-3 py-2 text-left text-xs text-slate-400"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
