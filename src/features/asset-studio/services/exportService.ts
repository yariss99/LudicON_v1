import type { AssetStudioDocument, ExportFormat } from "../types";
import { EXPORT_FORMATS } from "../constants";

export type ExportResult = {
  format: ExportFormat;
  filename: string;
  mimeType: string;
  content: string;
  available: boolean;
};

/**
 * ExportService — produces downloadable drafts. SCORM remains future placeholder.
 */
export const exportService = {
  formats() {
    return EXPORT_FORMATS;
  },

  export(doc: AssetStudioDocument, format: ExportFormat): ExportResult {
    const meta = EXPORT_FORMATS.find((f) => f.id === format);
    const available = Boolean(meta?.available);
    const base = doc.title.replace(/\s+/g, "_").slice(0, 40);

    if (!available) {
      return {
        format,
        filename: `${base}.scorm.zip`,
        mimeType: "application/zip",
        content: "",
        available: false,
      };
    }

    const body = doc.nodes
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((n) => `## ${n.title}\n${n.body}`)
      .join("\n\n");

    const header = [
      `Asset: ${doc.title}`,
      `Blueprint: ${doc.blueprintVersionLabel}`,
      `Asset Studio revision: ${doc.currentRevisionId}`,
      "",
    ].join("\n");

    switch (format) {
      case "html":
        return {
          format,
          filename: `${base}.html`,
          mimeType: "text/html",
          available: true,
          content: `<!doctype html><html><head><meta charset="utf-8"><title>${doc.title}</title></head><body><pre>${escapeHtml(header + body)}</pre></body></html>`,
        };
      case "pdf":
      case "docx":
      case "pptx":
        // Structured text payload — host app can pipe to real renderers later
        return {
          format,
          filename: `${base}.${format}`,
          mimeType: "text/plain",
          available: true,
          content: `${header}${body}\n\n[Export format: ${format.toUpperCase()} — Blueprint ${doc.blueprintVersionLabel} preserved]`,
        };
      case "scorm":
        return {
          format,
          filename: `${base}.scorm.zip`,
          mimeType: "application/zip",
          content: "",
          available: false,
        };
    }
  },
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
