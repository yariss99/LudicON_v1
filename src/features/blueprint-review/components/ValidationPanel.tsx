import { VALIDATION_STATUS_LABEL } from "../constants";
import type { ValidationReport } from "../types";
import IssueCard from "./IssueCard";

type ValidationPanelProps = {
  validation: ValidationReport | null;
  loading?: boolean;
  onRetry?: () => void;
};

function ValidationPanel({
  validation,
  loading,
  onRetry,
}: ValidationPanelProps) {
  return (
    <aside
      className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto"
      aria-label="Verificarea lecției"
    >
      <p className="text-sm font-semibold text-slate-900">Verificarea lecției</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Privim împreună coerența pedagogică după fiecare pas.
      </p>

      {loading ? (
        <div className="mt-4 space-y-3" aria-busy>
          <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <p className="text-center text-xs text-slate-500">
            Pregătim informațiile lecției…
          </p>
        </div>
      ) : !validation ? (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Mai avem nevoie de câteva informații pentru a continua.
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Verifică din nou
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <Stat
              label="Completitudine"
              value={`${Math.round(validation.overallCompleteness * 100)}%`}
            />
            <Stat
              label="Încredere"
              value={`${Math.round(validation.confidenceScore * 100)}%`}
            />
            <Stat
              label="Coerență"
              value={validation.consistencyOk ? "Aliniat" : "De armonizat"}
            />
            <Stat
              label="Stare"
              value={VALIDATION_STATUS_LABEL[validation.status]}
            />
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Gata de confirmare
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {validation.readyForApproval ? "Da" : "Nu încă"}
            </p>
            {!validation.readyForApproval ? (
              <ul className="mt-2 space-y-1 text-xs text-slate-500">
                {validation.blockingReasons.slice(0, 4).map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Poți confirma proiectul lecției când ești mulțumit.
              </p>
            )}
          </div>

          {validation.issues.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Aspecte de revăzut
              </p>
              {validation.issues.slice(0, 6).map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : null}

          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 w-full rounded-full px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Verifică din nou
            </button>
          ) : null}
        </>
      )}
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default ValidationPanel;
