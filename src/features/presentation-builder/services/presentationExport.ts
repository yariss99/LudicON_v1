import { THEME_BY_ID } from "../constants";
import type { PresentationDocument, PresentationExportFormat } from "../types";

export type PresentationExportResult = {
  readonly format: PresentationExportFormat;
  readonly filename: string;
  readonly mimeType: string;
  readonly content: string;
  readonly uri: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toHtml(
  doc: PresentationDocument,
  mode: "interactive" | "presenter" | "student" | "print",
): string {
  const theme = THEME_BY_ID[doc.themeId];
  const slides = [...doc.slides]
    .sort((a, b) => a.order - b.order)
    .map((s, i) => {
      const bullets = s.bullets
        .map((b) => `<li>${escapeHtml(b)}</li>`)
        .join("");
      const media = s.media
        .map(
          (m) =>
            `<div class="media">${escapeHtml(m.kind)}: ${escapeHtml(m.label)}${m.promptOrUrl ? ` — ${escapeHtml(m.promptOrUrl)}` : ""}</div>`,
        )
        .join("");
      const notes =
        mode === "presenter" || mode === "print"
          ? `<aside class="notes">${escapeHtml(s.speakerNotes)}</aside>`
          : "";
      return `
      <section class="slide" id="slide-${i}" data-index="${i}">
        <header><span class="type">${escapeHtml(s.type)}</span><h2>${escapeHtml(s.title)}</h2></header>
        <p>${escapeHtml(s.body)}</p>
        ${bullets ? `<ul>${bullets}</ul>` : ""}
        ${media}
        ${notes}
      </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${escapeHtml(doc.locale)}">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(doc.title)}</title>
<style>
  :root{
    --bg:${theme.background};--surface:${theme.surface};--accent:${theme.accent};--text:${theme.text};
    --display:${theme.fontDisplay}, Georgia, serif;
  }
  body{margin:0;font-family:DM Sans,Segoe UI,sans-serif;background:var(--bg);color:var(--text)}
  h1,h2{font-family:var(--display)}
  .wrap{max-width:960px;margin:0 auto;padding:1.5rem}
  .slide{background:var(--surface);border-radius:18px;padding:1.5rem;margin:1rem 0;min-height:${mode === "presenter" ? "70vh" : "auto"};box-shadow:0 1px 2px rgba(0,0,0,.05)}
  .type{font-size:.7rem;letter-spacing:.04em;text-transform:uppercase;color:var(--accent)}
  .notes{margin-top:1rem;padding:.75rem;border-left:3px solid var(--accent);color:color-mix(in srgb,var(--text) 75%, transparent);font-size:.9rem}
  .media{margin-top:.5rem;font-size:.85rem;opacity:.85}
  ${mode === "student" ? ".notes{display:none}" : ""}
  ${mode === "print" ? "@media print{body{background:#fff}.slide{box-shadow:none;border:1px solid #ddd;page-break-after:always}}" : ""}
  .nav{position:sticky;bottom:1rem;display:flex;gap:.5rem;justify-content:center}
  .nav button{border:0;border-radius:999px;padding:.55rem 1rem;background:var(--accent);color:#fff;cursor:pointer}
</style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(doc.title)}</h1>
    <p>${escapeHtml(doc.subject)} · ${escapeHtml(doc.grade)} · ${doc.estimatedMinutes} min · ${escapeHtml(doc.source.label)}</p>
    ${slides}
    ${
      mode === "interactive" || mode === "presenter"
        ? `<div class="nav"><button onclick="step(-1)">Anterior</button><button onclick="step(1)">Următor</button></div>
           <script>
             let i=0;const slides=[...document.querySelectorAll('.slide')];
             function show(){slides.forEach((s,idx)=>s.style.outline=idx===i?'2px solid var(--accent)':'none');slides[i]?.scrollIntoView({behavior:'smooth',block:'center'})}
             function step(d){i=Math.max(0,Math.min(slides.length-1,i+d));show()}
             show();
           </script>`
        : ""
    }
  </div>
</body>
</html>`;
}

export function exportPresentation(
  doc: PresentationDocument,
  format: PresentationExportFormat,
): PresentationExportResult {
  const base =
    doc.title.replace(/[^\w\-ăâîșțĂÂÎȘȚ ]+/gi, "").trim() || "presentation";
  const stamp = doc.version;

  if (format === "pptx") {
    const content = [
      `# ${doc.title}`,
      `Theme: ${doc.themeId}`,
      "",
      ...[...doc.slides]
        .sort((a, b) => a.order - b.order)
        .flatMap((s, i) => [
          `## Slide ${i + 1}: ${s.title} (${s.type})`,
          s.body,
          ...s.bullets.map((b) => `- ${b}`),
          s.speakerNotes ? `Notes: ${s.speakerNotes}` : "",
          "",
        ]),
    ].join("\n");
    return {
      format,
      filename: `${base}-v${stamp}.pptx.txt`,
      mimeType: "text/plain;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.pptx`,
    };
  }

  const mode =
    format === "presenter"
      ? "presenter"
      : format === "student"
        ? "student"
        : format === "print" || format === "pdf"
          ? "print"
          : "interactive";

  const content = toHtml(doc, mode);
  return {
    format,
    filename: `${base}-v${stamp}.${format}.html`,
    mimeType: "text/html;charset=utf-8",
    content,
    uri: `memory://exports/${doc.projectId}/${doc.id}.${format}.html`,
  };
}

export function downloadExport(result: PresentationExportResult): void {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}
