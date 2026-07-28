import { STUDIO_BLOCK_KINDS } from "../constants";
import type { SmartCommandProposal, StudioNode } from "../types";

type EditingCanvasProps = {
  node: StudioNode | null;
  proposal: SmartCommandProposal | null;
  commandInput: string;
  onCommandInput: (value: string) => void;
  onBodyChange: (body: string) => void;
  onKindChange: (kind: StudioNode["kind"]) => void;
  onRequestCommand: () => void;
  onApproveCommand: () => void;
  onRejectCommand: () => void;
};

function EditingCanvas({
  node,
  proposal,
  commandInput,
  onCommandInput,
  onBodyChange,
  onKindChange,
  onRequestCommand,
  onApproveCommand,
  onRejectCommand,
}: EditingCanvasProps) {
  if (!node) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-white text-sm text-slate-500 ring-1 ring-slate-200/70">
        Alege o secțiune din structura materialului.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-5 ring-1 ring-slate-200/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Editare
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {node.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Legat de proiectul lecției:{" "}
            {node.sourceSections.map((s) => s.replace(/_/g, " ")).join(" · ") ||
              "general"}
          </p>
        </div>
        <label className="text-xs text-slate-500">
          Tip de bloc
          <select
            value={node.kind}
            onChange={(e) =>
              onKindChange(e.target.value as StudioNode["kind"])
            }
            className="mt-1 block rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200"
          >
            {STUDIO_BLOCK_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className={[
          "rounded-2xl ring-1",
          node.kind === "callout"
            ? "bg-amber-50/60 ring-amber-100"
            : node.kind === "list"
              ? "bg-slate-50 ring-slate-100"
              : "bg-[#F8F9FB] ring-slate-100",
        ].join(" ")}
      >
        <textarea
          value={node.body}
          onChange={(e) => onBodyChange(e.target.value)}
          rows={12}
          className="w-full resize-y border-0 bg-transparent px-4 py-4 text-sm leading-relaxed text-slate-800 outline-none"
          placeholder="Rafinează acest bloc — verificăm împreună coerența cu proiectul lecției."
        />
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Smart commands
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Example: “Differentiate this activity.” · “Make this collaborative.” ·
          “Simplify for Grade II.”
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={commandInput}
            onChange={(e) => onCommandInput(e.target.value)}
            placeholder="Write a pedagogical command…"
            className="flex-1 rounded-full bg-white px-4 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            type="button"
            onClick={onRequestCommand}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Propose
          </button>
        </div>

        {proposal?.status === "pending" ? (
          <div className="mt-3 rounded-2xl bg-white px-3 py-3 ring-1 ring-sky-100">
            <p className="text-xs font-semibold text-slate-800">
              {proposal.summary}
            </p>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-sans text-xs text-slate-600">
              {proposal.proposedBody}
            </pre>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={onApproveCommand}
                className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={onRejectCommand}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
              >
                Reject
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default EditingCanvas;
