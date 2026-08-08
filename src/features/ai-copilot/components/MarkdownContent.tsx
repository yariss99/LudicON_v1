import { useMemo } from "react";

/** Lightweight markdown renderer for Copilot cards (no dependency). */
export function MarkdownContent({ source }: { source: string }) {
  const html = useMemo(() => renderMarkdown(source), [source]);
  return (
    <div
      className="ac-md"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return out;
}

function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;
  let inList: "ul" | "ol" | null = null;
  let inTable = false;

  const closeList = () => {
    if (inList) {
      html.push(`</${inList}>`);
      inList = null;
    }
  };
  const closeTable = () => {
    if (inTable) {
      html.push("</tbody></table>");
      inTable = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("```")) {
      closeList();
      closeTable();
      const lang = escapeHtml(line.slice(3).trim());
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        code.push(lines[i] ?? "");
        i += 1;
      }
      html.push(
        `<pre><code class="language-${lang}">${escapeHtml(code.join("\n"))}</code></pre>`,
      );
      i += 1;
      continue;
    }

    if (line.trim().startsWith("|") && line.includes("|")) {
      closeList();
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      const next = lines[i + 1] ?? "";
      const isSep = /^\|?\s*:?-{3,}/.test(next);
      if (!inTable) {
        html.push("<table><thead><tr>");
        cells.forEach((c) => html.push(`<th>${renderInline(c)}</th>`));
        html.push("</tr></thead><tbody>");
        inTable = true;
        i += isSep ? 2 : 1;
        continue;
      }
      html.push("<tr>");
      cells.forEach((c) => html.push(`<td>${renderInline(c)}</td>`));
      html.push("</tr>");
      i += 1;
      continue;
    }
    closeTable();

    if (/^###\s+/.test(line)) {
      closeList();
      html.push(`<h3>${renderInline(line.replace(/^###\s+/, ""))}</h3>`);
      i += 1;
      continue;
    }
    if (/^##\s+/.test(line)) {
      closeList();
      html.push(`<h2>${renderInline(line.replace(/^##\s+/, ""))}</h2>`);
      i += 1;
      continue;
    }
    if (/^#\s+/.test(line)) {
      closeList();
      html.push(`<h1>${renderInline(line.replace(/^#\s+/, ""))}</h1>`);
      i += 1;
      continue;
    }
    if (/^>\s+/.test(line)) {
      closeList();
      html.push(`<blockquote>${renderInline(line.replace(/^>\s+/, ""))}</blockquote>`);
      i += 1;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (inList !== "ul") {
        closeList();
        html.push("<ul>");
        inList = "ul";
      }
      html.push(`<li>${renderInline(line.replace(/^[-*]\s+/, ""))}</li>`);
      i += 1;
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (inList !== "ol") {
        closeList();
        html.push("<ol>");
        inList = "ol";
      }
      html.push(`<li>${renderInline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      i += 1;
      continue;
    }
    if (!line.trim()) {
      closeList();
      i += 1;
      continue;
    }
    closeList();
    html.push(`<p>${renderInline(line)}</p>`);
    i += 1;
  }
  closeList();
  closeTable();
  return html.join("");
}
