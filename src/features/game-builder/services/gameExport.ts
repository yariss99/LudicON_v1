import type { GameDocument, GameExportFormat } from "../types";
import { GAME_KINDS } from "../constants";

export type GameExportResult = {
  readonly format: GameExportFormat;
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

function toHtml(doc: GameDocument, mode: "play" | "classroom" | "print"): string {
  const kind = GAME_KINDS.find((k) => k.id === doc.kind)?.label ?? doc.kind;
  const levels = [...doc.levels]
    .sort((a, b) => a.order - b.order)
    .map((level) => {
      const challenges = doc.challenges
        .filter((c) => level.challengeIds.includes(c.id))
        .map(
          (c) =>
            `<li><strong>${escapeHtml(c.title)}</strong> (${c.difficulty}, ${c.points}p) — ${escapeHtml(c.description)}</li>`,
        )
        .join("");
      return `<section class="level"><h2>${escapeHtml(level.title)}</h2><p>${escapeHtml(level.objective)}</p><ul>${challenges}</ul></section>`;
    })
    .join("\n");

  const questions = [...doc.questions]
    .sort((a, b) => a.order - b.order)
    .map(
      (q, i) => `
      <article class="q" data-correct="${q.correctIndex}">
        <h3>${i + 1}. ${escapeHtml(q.prompt)} <small>(${q.points}p)</small></h3>
        <ol type="A">${q.choices.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ol>
        ${q.hint && mode !== "print" ? `<p class="hint">Indiciu: ${escapeHtml(q.hint)}</p>` : ""}
      </article>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(doc.title)}</title>
<style>
  body{font-family:DM Sans,Segoe UI,sans-serif;max-width:820px;margin:2rem auto;padding:0 1rem;color:#0f172a;background:#f8fafc}
  h1{font-family:Georgia,serif}
  .meta{color:#64748b}
  .level,.q{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:1rem;margin:1rem 0}
  .hint{color:#b45309;font-size:.9rem}
  ${mode === "classroom" ? ".level{min-height:40vh}" : ""}
  ${mode === "print" ? "@media print{body{margin:0}.hint{display:none}}" : ""}
</style>
</head>
<body>
  <h1>${escapeHtml(doc.title)}</h1>
  <p class="meta">${escapeHtml(kind)} · ${escapeHtml(doc.subject)} · ${escapeHtml(doc.grade)} · ${doc.estimatedMinutes} min</p>
  <p class="meta">Sursă: ${escapeHtml(doc.source.label)}</p>
  <h2>Reguli</h2>
  <pre>${escapeHtml(doc.rules)}</pre>
  ${levels}
  ${questions}
  ${mode === "classroom" ? `<p class="meta">Mod clasă — proiectează pe ecran și joacă pe rânduri.</p>` : ""}
</body>
</html>`;
}

export function exportGame(
  doc: GameDocument,
  format: GameExportFormat,
): GameExportResult {
  const base = doc.title.replace(/[^\w\-ăâîșțĂÂÎȘȚ ]+/gi, "").trim() || "game";
  const stamp = doc.version;

  if (format === "qr") {
    const launchUrl = `https://prima.local/play/${doc.projectId}/${doc.id}`;
    const content = JSON.stringify(
      {
        schema: "prima.game.qr.v1",
        title: doc.title,
        launchUrl,
        projectId: doc.projectId,
        lessonId: doc.lessonId,
        gameId: doc.id,
      },
      null,
      2,
    );
    return {
      format,
      filename: `${base}-qr-v${stamp}.json`,
      mimeType: "application/json;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.qr.json`,
    };
  }

  if (format === "web") {
    const content = JSON.stringify(
      { schema: "prima.game.web.v1", game: doc },
      null,
      2,
    );
    return {
      format,
      filename: `${base}-web-v${stamp}.json`,
      mimeType: "application/json;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.web.json`,
    };
  }

  const mode =
    format === "classroom" ? "classroom" : format === "print" ? "print" : "play";
  const content = toHtml(doc, mode);
  return {
    format,
    filename: `${base}-v${stamp}.${format}.html`,
    mimeType: "text/html;charset=utf-8",
    content,
    uri: `memory://exports/${doc.projectId}/${doc.id}.${format}.html`,
  };
}

export function downloadExport(result: GameExportResult): void {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}
