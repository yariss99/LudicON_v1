import type { StoryDocument, StoryExportFormat } from "../types";
import { SCENE_TYPES } from "../constants";

export type StoryExportResult = {
  readonly format: StoryExportFormat;
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

function toInteractiveHtml(doc: StoryDocument, mode: "student" | "teacher" | "presentation"): string {
  const scenes = [...doc.scenes]
    .sort((a, b) => a.order - b.order)
    .map((s, i) => {
      const typeLabel = SCENE_TYPES.find((t) => t.id === s.type)?.label ?? s.type;
      const choices = s.choices
        .map(
          (c) =>
            `<button class="choice" data-target="${escapeHtml(c.targetSceneId ?? "")}">${escapeHtml(c.label)}</button>`,
        )
        .join("");
      return `
      <article class="scene" id="${s.id}" data-index="${i}">
        <header><span class="type">${escapeHtml(typeLabel)}</span><h2>${escapeHtml(s.title)}</h2></header>
        <p class="narration">${escapeHtml(s.narration)}</p>
        ${s.dialogue ? `<blockquote>${escapeHtml(s.dialogue)}</blockquote>` : ""}
        ${s.challenge ? `<div class="challenge"><strong>Provocare:</strong> ${escapeHtml(s.challenge)}</div>` : ""}
        ${s.activity ? `<div class="activity"><strong>Activitate:</strong> ${escapeHtml(s.activity)}</div>` : ""}
        ${mode === "teacher" && s.assessmentMoment ? `<div class="teacher"><strong>Evaluare:</strong> ${escapeHtml(s.assessmentMoment)}</div>` : ""}
        <div class="choices">${choices}</div>
      </article>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(doc.title)}</title>
<style>
  body{font-family:Georgia,serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#0f172a;background:#f8fafc}
  h1{font-size:1.8rem}
  .meta{color:#64748b;font-size:.9rem}
  .scene{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:1.25rem;margin:1rem 0}
  .type{font-size:.7rem;text-transform:uppercase;letter-spacing:.04em;color:#0f766e}
  blockquote{border-left:3px solid #99f6e4;padding-left:.75rem;color:#334155}
  .choice{margin:.35rem .35rem 0 0;padding:.45rem .8rem;border-radius:999px;border:1px solid #cbd5e1;background:#f0fdfa;cursor:pointer}
  ${mode === "presentation" ? ".scene{min-height:60vh}" : ""}
  ${mode === "teacher" ? ".teacher{margin-top:.75rem;padding:.65rem;background:#fffbeb;border-radius:10px}" : ""}
</style>
</head>
<body>
  <h1>${escapeHtml(doc.title)}</h1>
  <p class="meta">${escapeHtml(doc.subject)} · ${escapeHtml(doc.grade)} · ${doc.estimatedMinutes} min · ${doc.kind}</p>
  ${mode === "teacher" ? `<p class="meta">Versiune profesor · obiective: ${escapeHtml(doc.objectives.join("; "))}</p>` : ""}
  ${scenes}
  <script>
    document.querySelectorAll('.choice').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id=btn.getAttribute('data-target');
        if(id){ const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth'}); }
      });
    });
  </script>
</body>
</html>`;
}

export function exportStory(
  doc: StoryDocument,
  format: StoryExportFormat,
): StoryExportResult {
  const base = doc.title.replace(/[^\w\-ăâîșțĂÂÎȘȚ ]+/gi, "").trim() || "story";
  const stamp = doc.version;

  if (format === "html" || format === "presentation") {
    const content = toInteractiveHtml(
      doc,
      format === "presentation" ? "presentation" : "student",
    );
    return {
      format,
      filename: `${base}-v${stamp}.${format}.html`,
      mimeType: "text/html;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.${format}.html`,
    };
  }

  if (format === "teacher") {
    const content = toInteractiveHtml(doc, "teacher");
    return {
      format,
      filename: `${base}-teacher-v${stamp}.html`,
      mimeType: "text/html;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.teacher.html`,
    };
  }

  if (format === "student") {
    const content = toInteractiveHtml(doc, "student");
    return {
      format,
      filename: `${base}-student-v${stamp}.html`,
      mimeType: "text/html;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.student.html`,
    };
  }

  // pdf / print booklet as text/html print-ready
  const content = toInteractiveHtml(doc, "student");
  return {
    format,
    filename: `${base}-v${stamp}.${format}.html`,
    mimeType: "text/html;charset=utf-8",
    content,
    uri: `memory://exports/${doc.projectId}/${doc.id}.${format}`,
  };
}

export function downloadExport(result: StoryExportResult): void {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}
