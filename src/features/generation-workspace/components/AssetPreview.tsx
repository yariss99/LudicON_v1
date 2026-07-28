import { useState } from "react";
import type { GeneratedAsset } from "../types";
import { assetVersionManager } from "../services/assetVersionManager";

type AssetPreviewProps = {
  asset: GeneratedAsset | null;
  streamingText: string;
};

function AssetPreview({ asset, streamingText }: AssetPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const blocks = asset ? assetVersionManager.currentBlocks(asset) : [];
  const body =
    streamingText ||
    blocks.map((b) => `## ${b.title}\n${b.body}`).join("\n\n") ||
    "No preview yet.";

  return (
    <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Preview
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Action
            label={expanded ? "Collapse" : "Expand"}
            onClick={() => setExpanded((v) => !v)}
          />
          <Action label="Duplicate" onClick={() => undefined} />
          <Action label="Export" onClick={() => undefined} />
          <Action label="Share" onClick={() => undefined} disabled />
        </div>
      </div>
      <pre
        className={[
          "overflow-auto whitespace-pre-wrap px-4 py-4 font-sans text-sm leading-relaxed text-slate-700",
          expanded ? "max-h-[70vh]" : "max-h-80",
        ].join(" ")}
      >
        {body}
      </pre>
    </div>
  );
}

function Action({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-white disabled:opacity-40"
    >
      {label}
      {disabled ? " (soon)" : ""}
    </button>
  );
}

export default AssetPreview;
