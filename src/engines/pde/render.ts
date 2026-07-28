import type { PublishFormatId, PublishRequest } from "./types";

export type RenderedPackage = {
  format: PublishFormatId;
  filename: string;
  mimeType: string;
  content: string;
  available: boolean;
};

/**
 * MVP renderers — text/HTML/JSON derivatives from publication intent.
 * Binary office formats are structured placeholders until production renderers land.
 */
export function renderPublicationPackage(
  request: PublishRequest,
  bodyMarkdown: string,
): RenderedPackage {
  const base = request.objectTitle.replace(/\s+/g, "_").slice(0, 48) || "material";
  const header = [
    `# ${request.objectTitle}`,
    `Destination: ${request.destination}`,
    `Channel: ${request.channel}`,
    `Object: ${request.objectId}@${request.objectVersionId}`,
    "",
  ].join("\n");

  switch (request.format) {
    case "html":
      return {
        format: "html",
        filename: `${base}.html`,
        mimeType: "text/html",
        available: true,
        content: `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>${escapeHtml(request.objectTitle)}</title></head><body><pre>${escapeHtml(header + bodyMarkdown)}</pre></body></html>`,
      };
    case "markdown":
      return {
        format: "markdown",
        filename: `${base}.md`,
        mimeType: "text/markdown",
        available: true,
        content: header + bodyMarkdown,
      };
    case "json":
      return {
        format: "json",
        filename: `${base}.json`,
        mimeType: "application/json",
        available: true,
        content: JSON.stringify(
          {
            objectId: request.objectId,
            objectVersionId: request.objectVersionId,
            title: request.objectTitle,
            destination: request.destination,
            channel: request.channel,
            body: bodyMarkdown,
          },
          null,
          2,
        ),
      };
    case "scorm":
    case "ims_cc":
      return {
        format: request.format,
        filename: `${base}.${request.format}.json`,
        mimeType: "application/json",
        available: true,
        content: JSON.stringify(
          {
            packageType: request.format,
            title: request.objectTitle,
            objectId: request.objectId,
            note: "Transitional package descriptor — binary zip renderer TBD",
            body: bodyMarkdown,
          },
          null,
          2,
        ),
      };
    case "pdf":
    case "docx":
    case "pptx":
      return {
        format: request.format,
        filename: `${base}.${request.format}.txt`,
        mimeType: "text/plain",
        available: true,
        content: `${header}${bodyMarkdown}\n\n[Renderer ${request.format.toUpperCase()} — derivative of pedagogical object ${request.objectId}]`,
      };
    default:
      return {
        format: request.format,
        filename: `${base}.txt`,
        mimeType: "text/plain",
        available: true,
        content: header + bodyMarkdown,
      };
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
