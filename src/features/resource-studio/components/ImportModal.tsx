import { useState } from "react";
import { IMPORT_OPTIONS } from "../constants";
import { useResourceStudio } from "../hooks/useResourceStudio";
import type { ResourceImportFormat } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ImportModal({ open, onClose }: Props) {
  const { importPlaceholder, projects, projectScope } = useResourceStudio();
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const canImport = Boolean(projectScope || projects[0]);

  if (!open) return null;

  const run = (format: ResourceImportFormat) => {
    if (format === "external_link") {
      if (!linkUrl.trim()) return;
      importPlaceholder("external_link", {
        title: linkTitle || linkUrl,
        href: linkUrl.trim(),
      });
      setLinkUrl("");
      setLinkTitle("");
      onClose();
      return;
    }
    importPlaceholder(format);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold tracking-tight">Import resource</h2>
        <p className="mt-1 text-sm text-slate-500">
          Placeholder connectors — files are registered in the library now;
          real upload pipelines arrive later.
        </p>

        {!canImport ? (
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
            Create a project first so imported resources have a home.
          </p>
        ) : (
          <div className="mt-5 grid gap-2">
            {IMPORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={!canImport || (opt.id === "external_link" && !linkUrl.trim())}
                onClick={() => run(opt.id)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
              >
                <span className="block text-sm font-semibold text-slate-900">
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
          <p className="text-xs font-semibold text-slate-500">External link</p>
          <input
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Title (optional)"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
          />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
