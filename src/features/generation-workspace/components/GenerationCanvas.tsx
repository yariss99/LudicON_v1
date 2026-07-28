import type {
  AssetTypeDefinition,
  GeneratedAsset,
  RegenerationScope,
} from "../types";
import GenerationPipeline from "./GenerationPipeline";
import AssetPreview from "./AssetPreview";

type GenerationCanvasProps = {
  definition: AssetTypeDefinition | null;
  asset: GeneratedAsset | null;
  busy: boolean;
  onGenerate: (scope: RegenerationScope) => void;
  onOpenStudio?: () => void;
};

function GenerationCanvas({
  definition,
  asset,
  busy,
  onGenerate,
  onOpenStudio,
}: GenerationCanvasProps) {
  if (!definition || !asset) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl bg-white px-6 text-center ring-1 ring-slate-200/70">
        <p className="text-xl font-semibold tracking-tight text-slate-900">
          Alege un material de pregătit.
        </p>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Selectează din listă. Materialele pornesc întotdeauna de la proiectul
          lecției confirmat — niciodată de la o pagină goală.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Se pregătesc materialele
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {definition.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{definition.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {asset.status === "completed" || asset.pipelineStage === "available" ? (
            <ScopeButton
              label="Deschide materialele lecției"
              disabled={busy || !onOpenStudio}
              onClick={() => onOpenStudio?.()}
            />
          ) : null}
          <ScopeButton
            label="Tot materialul"
            disabled={busy}
            onClick={() => onGenerate("entire_asset")}
          />
          <ScopeButton
            label="O secțiune"
            disabled={busy}
            onClick={() => onGenerate("selected_section")}
          />
          <ScopeButton
            label="O activitate"
            disabled={busy}
            onClick={() => onGenerate("selected_activity")}
          />
          <ScopeButton
            label="Evaluarea"
            disabled={busy}
            onClick={() => onGenerate("selected_assessment")}
          />
        </div>
      </div>

      <GenerationPipeline current={asset.pipelineStage} />

      {asset.errorMessage ? (
        <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-950 ring-1 ring-amber-100">
          {asset.errorMessage} — versiunea reușită anterioară a fost păstrată.
        </p>
      ) : null}

      {asset.outdated ? (
        <p className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-950 ring-1 ring-amber-100">
          Proiectul lecției s-a schimbat. Poți păstra, actualiza sau pregăti din nou materialul.
        </p>
      ) : null}

      <AssetPreview asset={asset} streamingText={asset.streamingText} />
    </div>
  );
}

function ScopeButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {label}
    </button>
  );
}

export default GenerationCanvas;
