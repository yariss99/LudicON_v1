import type { AssessmentDocument, AssessmentExportFormat } from "../types";

export type AssessmentExportResult = {
  readonly format: AssessmentExportFormat;
  readonly filename: string;
  readonly mimeType: string;
  readonly content: string;
  readonly uri: string;
};

function flattenQuestions(doc: AssessmentDocument) {
  return doc.groups.flatMap((g, gi) =>
    g.questions.map((q, qi) => ({
      group: g.title,
      index: `${gi + 1}.${qi + 1}`,
      ...q,
    })),
  );
}

function toHtml(doc: AssessmentDocument, printable: boolean): string {
  const items = flattenQuestions(doc)
    .map(
      (q) => `
      <section class="item">
        <h3>${q.index}. (${q.points}p) ${escapeHtml(q.prompt)}</h3>
        ${
          q.choices
            ? `<ul>${q.choices.map((c) => `<li>${escapeHtml(c.label)}</li>`).join("")}</ul>`
            : ""
        }
      </section>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(doc.title)}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 2rem auto; color: #0f172a; }
    h1 { font-size: 1.6rem; }
    .meta { color: #64748b; font-size: 0.9rem; }
    .item { margin: 1.25rem 0; padding-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; }
    ${printable ? "@media print { body { margin: 0; } }" : ""}
  </style>
</head>
<body>
  <h1>${escapeHtml(doc.title)}</h1>
  <p class="meta">${escapeHtml(doc.subject)} · ${escapeHtml(doc.grade)} · ${doc.durationMinutes} min · ${doc.kind}</p>
  <p>${escapeHtml(doc.groups[0]?.instructions ?? "")}</p>
  ${items}
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function exportAssessment(
  doc: AssessmentDocument,
  format: AssessmentExportFormat,
): AssessmentExportResult {
  const base = doc.title.replace(/[^\w\-ăâîșțĂÂÎȘȚ ]+/gi, "").trim() || "assessment";
  const stamp = doc.version;

  if (format === "html" || format === "printable") {
    const content = toHtml(doc, format === "printable");
    return {
      format,
      filename: `${base}-v${stamp}.html`,
      mimeType: "text/html;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.${format}.html`,
    };
  }

  if (format === "docx") {
    const content = [
      doc.title,
      `${doc.subject} | ${doc.grade} | ${doc.durationMinutes} min`,
      "",
      ...flattenQuestions(doc).map(
        (q) =>
          `${q.index}. (${q.points}p) ${q.prompt}${
            q.choices
              ? "\n" + q.choices.map((c) => ` - ${c.label}`).join("\n")
              : ""
          }`,
      ),
      "",
      "Bareme:",
      ...flattenQuestions(doc).map(
        (q) => `${q.index}: ${q.answerKey ?? "(manual)"}`,
      ),
    ].join("\n");
    return {
      format,
      filename: `${base}-v${stamp}.docx.txt`,
      mimeType: "text/plain;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.docx`,
    };
  }

  if (format === "lms") {
    const content = JSON.stringify(
      {
        schema: "prima.lms.assessment.v1",
        projectId: doc.projectId,
        lessonId: doc.lessonId,
        assessment: doc,
      },
      null,
      2,
    );
    return {
      format,
      filename: `${base}-v${stamp}.lms.json`,
      mimeType: "application/json;charset=utf-8",
      content,
      uri: `memory://exports/${doc.projectId}/${doc.id}.lms.json`,
    };
  }

  // pdf — text package suitable for print-to-PDF
  const content = toHtml(doc, true);
  return {
    format: "pdf",
    filename: `${base}-v${stamp}.pdf.html`,
    mimeType: "text/html;charset=utf-8",
    content,
    uri: `memory://exports/${doc.projectId}/${doc.id}.pdf`,
  };
}

export function downloadExport(result: AssessmentExportResult): void {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  a.click();
  URL.revokeObjectURL(url);
}
