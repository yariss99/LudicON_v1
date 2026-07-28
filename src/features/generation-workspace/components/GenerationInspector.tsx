import type {
  AssetTypeDefinition,
  GeneratedAsset,
  GenerationWorkspaceDocument,
} from "../types";
import { dependencyTracker } from "../services/dependencyTracker";
import { assetRegistry } from "../services/assetRegistry";
import { assetVersionManager } from "../services/assetVersionManager";
import QualityPanel from "./QualityPanel";
import QueuePanel from "./QueuePanel";

type GenerationInspectorProps = {
  workspace: GenerationWorkspaceDocument;
  definition: AssetTypeDefinition | null;
  asset: GeneratedAsset | null;
  onKeepOutdated: () => void;
  onRegenerateOutdated: () => void;
};

function GenerationInspector({
  workspace,
  definition,
  asset,
  onKeepOutdated,
  onRegenerateOutdated,
}: GenerationInspectorProps) {
  const version = asset?.versions.find((v) => v.id === asset.currentVersionId);
  const related = definition
    ? dependencyTracker.relatedAssets(definition.id)
    : [];
  const quality = version?.quality ?? null;
  const blocks = asset ? assetVersionManager.currentBlocks(asset) : [];

  return (
    <aside
      className="space-y-5 rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto"
      aria-label="Detalii despre material"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">Detalii</p>
        <p className="mt-1 text-xs text-slate-500">
          Fiecare material rămâne legat de proiectul lecției confirmat.
        </p>
      </div>

      <div className="space-y-2 text-xs">
        <Row label="Material curent" value={definition?.title ?? "—"} />
        <Row
          label="Din proiectul lecției"
          value={
            asset?.sourceBlueprintVersionLabel ??
            workspace.approvedBlueprintVersionLabel
          }
        />
        <Row
          label="Versiune"
          value={version?.versionLabel ?? "—"}
        />
        <Row
          label="Pregătit la"
          value={
            asset?.lastGeneratedAt
              ? new Date(asset.lastGeneratedAt).toLocaleString()
              : "—"
          }
        />
        <Row
          label="Calitate didactică"
          value={
            quality
              ? `${Math.round(quality.overall * 100)}% în ansamblu`
              : "Încă neevaluat"
          }
        />
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Legături
        </p>
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          {(definition?.dependencies.length
            ? definition.dependencies
            : [{ assetTypeId: definition?.id ?? "lesson_plan", reason: "De sine stătător" }]
          ).map((dep) => (
            <li key={`${dep.assetTypeId}_${dep.reason}`}>
              • {assetRegistry.get(dep.assetTypeId)?.title ?? dep.assetTypeId}
              {dep.reason !== "De sine stătător" && dep.reason !== "Standalone"
                ? ` — ${dep.reason}`
                : ""}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Părți din plan
        </p>
        <p className="mt-2 text-xs text-slate-600">
          {(definition?.sourceSections ?? [])
            .map((s) => s.replace(/_/g, " "))
            .join(" · ") || "—"}
        </p>
        {blocks[0] ? (
          <p className="mt-1 text-[11px] text-slate-400">
            Ultimul bloc se leagă de:{" "}
            {blocks[0].sourceSections.map((s) => s.replace(/_/g, " ")).join(", ")}
          </p>
        ) : null}
      </div>

      {asset?.outdated ? (
        <div className="rounded-2xl bg-amber-50 px-3 py-3 ring-1 ring-amber-100">
          <p className="text-xs font-semibold text-amber-950">Material de actualizat</p>
          <p className="mt-1 text-[11px] text-amber-900">
            Proiectul lecției s-a schimbat după ce acest material a fost pregătit.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onKeepOutdated}
              className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200"
            >
              Păstrează
            </button>
            <button
              type="button"
              onClick={onRegenerateOutdated}
              className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
            >
              Pregătește din nou
            </button>
          </div>
        </div>
      ) : null}

      {quality?.warnings.length ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            De revăzut
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-800">
            {quality.warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Materiale legate
        </p>
        <p className="mt-2 text-xs text-slate-600">
          {related.length
            ? related
                .map((id) => assetRegistry.get(id)?.title ?? id)
                .join(" · ")
            : "Niciunul"}
        </p>
      </div>

      <QualityPanel quality={quality} />
      <QueuePanel queue={workspace.queue} />
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default GenerationInspector;
