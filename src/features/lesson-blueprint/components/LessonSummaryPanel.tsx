import type { DecisionBlueprint } from "../../../engines/decision";
import type { PlannedMaterialId } from "../../blueprint-review/types";
import {
  AUTO_SAVE_SAVED,
  AUTO_SAVE_SYNCING,
  MATERIAL_ESTIMATE_MINUTES,
  PLANNED_MATERIAL_OPTIONS,
} from "../constants";

type LessonSummaryPanelProps = {
  blueprint: DecisionBlueprint;
  plannedMaterials: PlannedMaterialId[];
  activityCount: number;
  saving: boolean;
  creating: boolean;
  readOnly?: boolean;
  onSave: () => void;
  onPreview: () => void;
  onExport: () => void;
  onCreateMaterials: () => void;
};

function LessonSummaryPanel({
  blueprint,
  plannedMaterials,
  activityCount,
  saving,
  creating,
  readOnly,
  onSave,
  onPreview,
  onExport,
  onCreateMaterials,
}: LessonSummaryPanelProps) {
  const ctx = blueprint.learningContext;
  const estimate = plannedMaterials.reduce(
    (sum, id) => sum + (MATERIAL_ESTIMATE_MINUTES[id] ?? 2),
    0,
  );
  const materialLabels = plannedMaterials
    .map((id) => PLANNED_MATERIAL_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean);

  return (
    <aside
      className="space-y-5 rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 lg:sticky lg:top-6"
      aria-label="Rezumatul lecției"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Rezumat
        </p>
        <h2 className="mt-1 text-base font-semibold text-slate-900">
          Lecția ta, pe scurt
        </h2>
      </div>

      <dl className="space-y-3 text-sm">
        <Row label="Disciplina" value={ctx.subject || "—"} />
        <Row label="Clasa" value={ctx.grade || "—"} />
        <Row
          label="Durata"
          value={
            ctx.durationMinutes ? `${ctx.durationMinutes} minute` : "Nespecificată"
          }
        />
        <Row label="Număr activități" value={String(activityCount)} />
        <Row
          label="Număr obiective"
          value={String(blueprint.objectives.filter(Boolean).length)}
        />
        <Row
          label="Competențe"
          value={
            blueprint.competencies.filter(Boolean).length > 0
              ? blueprint.competencies.filter(Boolean).join(" · ")
              : "—"
          }
        />
        <Row
          label="Materiale selectate"
          value={
            materialLabels.length > 0 ? materialLabels.join(" · ") : "Niciunul încă"
          }
        />
        <Row
          label="Estimare pregătire"
          value={estimate > 0 ? `aprox. ${estimate} minute` : "—"}
        />
      </dl>

      <p className="text-xs text-emerald-700" aria-live="polite">
        {saving ? AUTO_SAVE_SYNCING : AUTO_SAVE_SAVED}
      </p>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onCreateMaterials}
          disabled={creating || readOnly}
          className="w-full rounded-full bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {creating ? "Pregătim…" : "Creează materialele"}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={readOnly}
          className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          Salvează
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Previzualizare
        </button>
        <button
          type="button"
          onClick={onExport}
          className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Exportă lecția
        </button>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 font-medium leading-relaxed text-slate-800">{value}</dd>
    </div>
  );
}

export default LessonSummaryPanel;
