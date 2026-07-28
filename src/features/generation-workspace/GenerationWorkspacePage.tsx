import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import AssetCatalog from "./components/AssetCatalog";
import GenerationCanvas from "./components/GenerationCanvas";
import GenerationInspector from "./components/GenerationInspector";
import { useGenerationWorkspace } from "./hooks/useGenerationWorkspace";

/**
 * IT-005 — Generation Workspace
 * Creative production studio. Always starts from an approved Blueprint.
 */
function GenerationWorkspacePage() {
  const gen = useGenerationWorkspace();
  const navigate = useNavigate();

  if (gen.uiState === "loading" || gen.uiState === "redirect_review") {
    return (
      <div className="min-h-screen bg-[#F4F5F7] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-56 animate-pulse rounded-full bg-slate-200" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200/80" />
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200/70 lg:col-span-1" />
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200/60" />
          </div>
        </div>
      </div>
    );
  }

  if (gen.uiState === "empty" || !gen.workspace) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F5F7] px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Materialele nu sunt încă disponibile
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Confirmă mai întâi proiectul lecției. Materialele pornesc întotdeauna
          de acolo — niciodată de la o idee goală.
        </p>
        <Link
          to="/create/experience"
          className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline"
        >
          Creează o lecție
        </Link>
      </div>
    );
  }

  const workspace = gen.workspace;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 antialiased">
      <header className="border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/blueprint/review/${workspace.blueprintId}`}
              className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-800"
            >
              <ArrowLeft size={16} aria-hidden />
              Verifică lecția
            </Link>
            <div className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles size={14} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  Pregătirea materialelor
                </p>
                <p className="text-[11px] text-slate-400">
                  {workspace.title} · Proiect{" "}
                  {workspace.approvedBlueprintVersionLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {gen.error ? (
        <div className="mx-auto max-w-[1600px] px-4 pt-4 sm:px-6">
          <div
            role="alert"
            className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-100"
          >
            {gen.error}
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1600px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:gap-6 lg:px-6 lg:py-6">
        <div className="order-2 lg:order-1">
          <AssetCatalog
            definitions={gen.catalog}
            assets={workspace.assets}
            selectedId={workspace.selectedAssetTypeId}
            onSelect={gen.selectAsset}
            onGenerate={(id) => {
              void gen.generate(id, "entire_asset");
            }}
          />
        </div>

        <main className="order-1 min-w-0 lg:order-2">
          <GenerationCanvas
            definition={gen.selectedDefinition}
            asset={gen.selectedAsset}
            busy={gen.busy}
            onGenerate={(scope) => {
              if (!workspace.selectedAssetTypeId) return;
              void gen.generate(workspace.selectedAssetTypeId, scope);
            }}
            onOpenStudio={() => {
              if (!workspace.selectedAssetTypeId) return;
              navigate(
                `/asset-studio/${workspace.id}/${workspace.selectedAssetTypeId}`,
              );
            }}
          />
        </main>

        <div className="order-3">
          <GenerationInspector
            workspace={workspace}
            definition={gen.selectedDefinition}
            asset={gen.selectedAsset}
            onKeepOutdated={gen.keepOutdated}
            onRegenerateOutdated={gen.regenerateSelected}
          />
        </div>
      </div>
    </div>
  );
}

export default GenerationWorkspacePage;
