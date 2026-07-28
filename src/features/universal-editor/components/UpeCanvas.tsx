import { BLOCK_LABELS } from "../constants";
import type { UpeDocument, UpeEditorBlock, UpePreviewMode } from "../types";

type UpeCanvasProps = {
  document: UpeDocument;
  selectedBlockId: string | null;
  previewMode: UpePreviewMode;
  onSelect: (id: string) => void;
  onChangeText: (text: string) => void;
};

function visibleInPreview(block: UpeEditorBlock, mode: UpePreviewMode): boolean {
  if (block.visibility === "hidden") return false;
  if (mode === "student" || mode === "printable" || mode === "mobile") {
    return block.visibility !== "teacher";
  }
  return true;
}

function UpeCanvas({
  document,
  selectedBlockId,
  previewMode,
  onSelect,
  onChangeText,
}: UpeCanvasProps) {
  const widthClass =
    previewMode === "mobile"
      ? "max-w-sm"
      : previewMode === "presentation"
        ? "max-w-3xl"
        : "max-w-2xl";

  return (
    <div className={["mx-auto space-y-4", widthClass].join(" ")}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--prima-text-muted)]">
          Canvas · {previewMode}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {document.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--prima-text-muted)]">
          {document.subject}
          {document.grade ? ` · ${document.grade}` : ""}
        </p>
      </div>

      <div className="space-y-3">
        {document.blocks.map((block) => {
          if (!visibleInPreview(block, previewMode)) return null;
          const selected = block.id === selectedBlockId;
          const isDivider = block.type === "divider";

          return (
            <article
              key={block.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(block.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(block.id);
              }}
              className={[
                "rounded-[var(--radius-lg)] border bg-[var(--prima-surface)] p-4 shadow-[var(--shadow-soft)] transition",
                selected
                  ? "border-[var(--prima-primary)] ring-2 ring-[var(--prima-primary)]/20"
                  : "border-[var(--prima-border)]",
                block.locked ? "opacity-90" : "",
              ].join(" ")}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--prima-text-muted)]">
                  {BLOCK_LABELS[block.type] ?? block.type}
                </span>
                {block.visibility === "teacher" ? (
                  <span className="text-[11px] text-[var(--prima-accent)]">
                    Doar profesor
                  </span>
                ) : null}
              </div>

              {isDivider ? (
                <hr className="border-[var(--prima-border)]" />
              ) : selected && !block.locked ? (
                <textarea
                  value={String(block.content.text ?? "")}
                  onChange={(e) => onChangeText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  rows={previewMode === "presentation" ? 4 : 3}
                  className="w-full resize-y rounded-[var(--radius-sm)] border border-[var(--prima-border)] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--prima-primary)]"
                />
              ) : (
                <p
                  className={[
                    "whitespace-pre-wrap text-[var(--prima-text)]",
                    block.type === "heading"
                      ? "text-xl font-semibold"
                      : "text-sm leading-relaxed",
                    previewMode === "accessibility"
                      ? "text-base leading-7"
                      : "",
                  ].join(" ")}
                >
                  {String(block.content.text ?? "")}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default UpeCanvas;
