import { useState } from "react";
import { Sparkles } from "lucide-react";
import { STUDIO_AI_ACTIONS } from "../constants";

type AISidebarProps = {
  projectTitle: string;
};

function AISidebar({ projectTitle }: AISidebarProps) {
  const [toast, setToast] = useState<string | null>(null);

  const runAction = (label: string) => {
    setToast(
      `Suggestion noted: “${label}”. You decide if and when to apply it.`,
    );
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <aside className="flex h-full flex-col rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-6">
      <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">AI Coach</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Educational collaborator for “{projectTitle}”. Suggests — never
            takes control.
          </p>
        </div>
      </div>

      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        Suggestions
      </p>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {STUDIO_AI_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => runAction(action.label)}
            className="w-full rounded-2xl border border-transparent bg-slate-50 px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          >
            <p className="text-sm font-medium text-slate-800">{action.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{action.description}</p>
          </button>
        ))}
      </div>

      {toast ? (
        <div className="mt-4 rounded-2xl bg-slate-900 px-3.5 py-3 text-xs leading-relaxed text-white">
          {toast}
        </div>
      ) : (
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          AI proposes. You decide.
        </p>
      )}
    </aside>
  );
}

export default AISidebar;
