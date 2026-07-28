import type { UpeDocument, UpeSearchHit } from "../types";

export function searchUpeDocument(
  document: UpeDocument,
  query: string,
): UpeSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: UpeSearchHit[] = [];

  document.learningObjectives.forEach((obj, index) => {
    if (obj.toLowerCase().includes(q)) {
      hits.push({
        id: `obj_${index}`,
        kind: "objective",
        title: "Obiectiv de învățare",
        excerpt: obj,
      });
    }
  });

  document.competencies.forEach((c, index) => {
    if (c.toLowerCase().includes(q)) {
      hits.push({
        id: `comp_${index}`,
        kind: "competency",
        title: "Competență",
        excerpt: c,
      });
    }
  });

  for (const block of document.blocks) {
    const text = String(block.content.text ?? "");
    if (
      text.toLowerCase().includes(q) ||
      block.type.toLowerCase().includes(q)
    ) {
      hits.push({
        id: `hit_${block.id}`,
        kind: "block",
        title: labelForBlock(block.type),
        excerpt: text.slice(0, 120) || block.type,
        blockId: block.id,
      });
    }
  }

  return hits.slice(0, 20);
}

function labelForBlock(type: string): string {
  const map: Record<string, string> = {
    heading: "Titlu",
    paragraph: "Paragraf",
    exercise: "Exercițiu",
    hint: "Indiciu",
    teacher_note: "Notă pentru profesor",
    success_criteria: "Criterii de succes",
    reflection: "Reflecție",
  };
  return map[type] ?? type;
}
