import { ArrowLeft, Sparkles } from "lucide-react";
import AssetStructure from "./components/AssetStructure";
import EditingCanvas from "./components/EditingCanvas";
import StudioInspector from "./components/StudioInspector";
import { useAssetStudio } from "./hooks/useAssetStudio";

/**
 * IT-006 — Asset Studio
 * Synchronized educational design studio. Not a document editor.
 */
function AssetStudioPage() {
  const studio = useAssetStudio();

  if (studio.loading) {
    return (
      <div className="min-h-screen bg-[#F4F5F7] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-full bg-slate-200" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200/80" />
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200/70" />
            <div className="h-64 animate-pulse rounded-3xl bg-slate-200/60" />
          </div>
        </div>
      </div>
    );
  }

  if (!studio.doc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F5F7] px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Materialele lecției nu sunt disponibile
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          {studio.error ??
            "Pregătește mai întâi un material din proiectul lecției confirmat."}
        </p>
        <button
          type="button"
          onClick={studio.backToGeneration}
          className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Înapoi la materiale
        </button>
      </div>
    );
  }

  const doc = studio.doc;

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900 antialiased">
      <header className="border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={studio.backToGeneration}
              className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            >
              <ArrowLeft size={16} aria-hidden />
              Materiale
            </button>
            <div className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles size={14} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  Materialele lecției
                </p>
                <p className="text-[11px] text-slate-400">
                  {doc.title} · Proiect {doc.blueprintVersionLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {studio.exportNotice ? (
        <div className="mx-auto max-w-[1600px] px-4 pt-3 sm:px-6">
          <p className="rounded-2xl bg-emerald-50 px-4 py-2 text-xs text-emerald-900 ring-1 ring-emerald-100">
            {studio.exportNotice}
          </p>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1600px] gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[240px_minmax(0,1fr)_320px] lg:gap-6 lg:px-6 lg:py-6">
        <AssetStructure
          items={studio.structure}
          selectedId={doc.selectedNodeId}
          onSelect={studio.selectNode}
        />

        <main className="min-w-0">
          <EditingCanvas
            node={studio.selectedNode}
            proposal={doc.pendingProposal}
            commandInput={studio.commandInput}
            onCommandInput={studio.setCommandInput}
            onBodyChange={studio.updateBody}
            onKindChange={studio.updateKind}
            onRequestCommand={studio.requestCommand}
            onApproveCommand={studio.approveCommand}
            onRejectCommand={studio.rejectCommand}
          />
        </main>

        <StudioInspector
          doc={doc}
          node={studio.selectedNode}
          commentInput={studio.commentInput}
          onCommentInput={studio.setCommentInput}
          onAddComment={studio.addComment}
          onResolveComment={studio.resolveComment}
          onSave={studio.save}
          onRestore={studio.restore}
          onDuplicate={studio.duplicate}
          onBranch={studio.branch}
          onExport={studio.exportAsset}
          onAlignmentDecision={studio.alignmentDecision}
        />
      </div>
    </div>
  );
}

export default AssetStudioPage;
