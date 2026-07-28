import type { PedagogicalDnaProfile } from "../../types/pedagogicalDna";

export function exportDnaAsMarkdown(profile: PedagogicalDnaProfile): string {
  const lines: string[] = [
    `# Pedagogical Profile — ${profile.teacherFirstName}`,
    "",
    `Generated ${new Date(profile.generatedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    "",
    "> Professional teaching style patterns. Not a score. Not a ranking.",
    "",
    "## Summary",
    "",
    profile.summary,
    "",
    "## Signature styles",
    "",
    ...profile.signatureStyles.map((s) => `- ${s}`),
    "",
    "## Dimensions",
    "",
  ];

  for (const dimension of profile.dimensions) {
    lines.push(`### ${dimension.title}`);
    lines.push("");
    lines.push(dimension.subtitle);
    lines.push("");
    if (dimension.patterns.length === 0) {
      lines.push("_Still gathering in this area._");
      lines.push("");
      continue;
    }
    for (const pattern of dimension.patterns) {
      lines.push(
        `- **${pattern.label}** (${pattern.presence}) — ${pattern.narrative}`,
      );
    }
    lines.push("");
  }

  lines.push("## Evolution across years", "");
  for (const year of profile.evolution) {
    lines.push(`### ${year.schoolYear}`);
    lines.push("");
    lines.push(year.note);
    lines.push("");
  }

  lines.push("## Suggestions that fit this style", "");
  lines.push("_Optional. The teacher always decides._");
  lines.push("");
  for (const suggestion of profile.adaptedSuggestions) {
    lines.push(`- **${suggestion.title}** — ${suggestion.detail}`);
    lines.push(`  - _${suggestion.whyItFits}_`);
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("Exported from PRIMA for reflection or professional portfolio.");

  return lines.join("\n");
}

export function exportDnaAsJson(profile: PedagogicalDnaProfile): string {
  return JSON.stringify(profile, null, 2);
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/plain",
): void {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
