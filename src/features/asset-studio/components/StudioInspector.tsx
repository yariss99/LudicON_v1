import { ALIGNMENT_STATUS_LABEL, EXPORT_FORMATS } from "../constants";
import type {
  AlignmentIssue,
  AssetStudioDocument,
  ExportFormat,
  StudioNode,
} from "../types";
import { assetRegistry } from "../../generation-workspace/services/assetRegistry";

type StudioInspectorProps = {
  doc: AssetStudioDocument;
  node: StudioNode | null;
  commentInput: string;
  onCommentInput: (value: string) => void;
  onAddComment: () => void;
  onResolveComment: (id: string) => void;
  onSave: () => void;
  onRestore: (revisionId: string) => void;
  onDuplicate: () => void;
  onBranch: () => void;
  onExport: (format: ExportFormat) => void;
  onAlignmentDecision: (
    issueId: string,
    decision: "keep" | "revise" | "update_blueprint",
  ) => void;
};

function StudioInspector({
  doc,
  node,
  commentInput,
  onCommentInput,
  onAddComment,
  onResolveComment,
  onSave,
  onRestore,
  onDuplicate,
  onBranch,
  onExport,
  onAlignmentDecision,
}: StudioInspectorProps) {
  const assetTitle =
    assetRegistry.get(doc.assetTypeId)?.title ?? doc.assetTypeId;
  const nodeComments = doc.comments.filter((c) => c.nodeId === node?.id);
  const currentRevision = doc.revisions.find(
    (r) => r.id === doc.currentRevisionId,
  );

  return (
    <aside
      className="space-y-5 rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto"
      aria-label="Detalii despre material"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">Detalii</p>
        <p className="mt-1 text-xs text-slate-500">
          Legătura cu proiectul lecției este întotdeauna păstrată.
        </p>
      </div>

      <div className="space-y-2 text-xs">
        <Row label="Material" value={assetTitle} />
        <Row label="Din proiectul lecției" value={doc.blueprintVersionLabel} />
        <Row
          label="Obiective de învățare"
          value={doc.blueprintSnapshot.objectives[0] ?? "—"}
        />
        <Row
          label="Competențe"
          value={doc.blueprintSnapshot.competencies[0] ?? "—"}
        />
        <Row
          label="Materiale legate"
          value={
            doc.relatedAssetTypeIds
              .map((id) => assetRegistry.get(id)?.title ?? id)
              .join(" · ") || "Niciunul"
          }
        />
        <Row
          label="Aliniere"
          value={
            doc.alignment
              ? ALIGNMENT_STATUS_LABEL[doc.alignment.status]
              : "Necunoscută"
          }
        />
        <Row
          label="Versiune"
          value={currentRevision?.versionLabel ?? "—"}
        />
      </div>

      {doc.alignment && doc.alignment.issues.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Aspecte de armonizat
          </p>
          <ul className="mt-2 space-y-2">
            {doc.alignment.issues.map((issue) => (
              <AlignmentCard
                key={issue.id}
                issue={issue}
                onDecision={onAlignmentDecision}
              />
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Note
          </p>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
          >
            Salvează versiunea
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={commentInput}
            onChange={(e) => onCommentInput(e.target.value)}
            placeholder="Notă pentru tine…"
            className="flex-1 rounded-full bg-slate-50 px-3 py-1.5 text-xs ring-1 ring-slate-200"
          />
          <button
            type="button"
            onClick={onAddComment}
            className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-slate-200"
          >
            Adaugă
          </button>
        </div>
        <ul className="mt-2 space-y-2">
          {nodeComments.length === 0 ? (
            <li className="text-xs text-slate-500">Nicio notă pe această parte.</li>
          ) : (
            nodeComments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-2xl bg-slate-50 px-3 py-2 text-xs ring-1 ring-slate-100"
              >
                <p className="font-medium text-slate-800">{comment.body}</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {comment.author} ·{" "}
                  {comment.status === "open" ? "deschisă" : "rezolvată"}
                </p>
                {comment.status === "open" ? (
                  <button
                    type="button"
                    onClick={() => onResolveComment(comment.id)}
                    className="mt-1 text-[11px] font-semibold text-sky-700"
                  >
                    Rezolvă
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Versiuni
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-slate-200"
          >
            Duplică
          </button>
          <button
            type="button"
            onClick={onBranch}
            className="rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-slate-200"
          >
            Variantă nouă
          </button>
        </div>
        <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto">
          {doc.revisions.slice(0, 8).map((revision) => (
            <li
              key={revision.id}
              className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs ring-1 ring-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {revision.versionLabel}
                  {revision.id === doc.currentRevisionId ? " · curentă" : ""}
                </p>
                <p className="text-slate-500">{revision.summary}</p>
              </div>
              {revision.id !== doc.currentRevisionId ? (
                <button
                  type="button"
                  onClick={() => onRestore(revision.id)}
                  className="font-semibold text-slate-700"
                >
                  Restaurează
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Descarcă
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXPORT_FORMATS.map((format) => (
            <button
              key={format.id}
              type="button"
              disabled={!format.available}
              onClick={() => onExport(format.id)}
              className="rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-slate-200 disabled:opacity-40"
            >
              {format.label}
              {!format.available ? " (în curând)" : ""}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AlignmentCard({
  issue,
  onDecision,
}: {
  issue: AlignmentIssue;
  onDecision: (
    issueId: string,
    decision: "keep" | "revise" | "update_blueprint",
  ) => void;
}) {
  return (
    <li className="rounded-2xl bg-amber-50 px-3 py-2.5 text-xs text-amber-950 ring-1 ring-amber-100">
      <p className="font-semibold">{ALIGNMENT_STATUS_LABEL[issue.status]}</p>
      <p className="mt-1 leading-relaxed">{issue.message}</p>
      <p className="mt-1 text-[11px] opacity-80">{issue.suggestion}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => onDecision(issue.id, "keep")}
          className="rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-amber-200"
        >
          Păstrează
        </button>
        <button
          type="button"
          onClick={() => onDecision(issue.id, "revise")}
          className="rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-amber-200"
        >
          Revizuiește
        </button>
        <button
          type="button"
          onClick={() => onDecision(issue.id, "update_blueprint")}
          className="rounded-full bg-slate-900 px-2.5 py-1 font-semibold text-white"
        >
          Actualizează proiectul lecției
        </button>
      </div>
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 font-medium leading-relaxed text-slate-800">{value}</p>
    </div>
  );
}

export default StudioInspector;
