import type {
  KnowledgeNode,
  KnowledgeSearchHit,
  KnowledgeSearchQuery,
} from "./types";

/**
 * Parse simple Romanian natural-language queries into structured facets.
 * Example: "activități cooperative pentru Matematică clasa a II-a"
 */
export function parseNaturalLanguageQuery(text: string): KnowledgeSearchQuery {
  const q: KnowledgeSearchQuery = { text };
  const lower = text.toLowerCase();

  if (/clasa a ii-a|clasa a 2-a|cls\.?\s*ii\b/i.test(lower)) {
    q.grade = "Clasa a II-a";
  } else if (/clasa a iii-a|clasa a 3-a|cls\.?\s*iii\b/i.test(lower)) {
    q.grade = "Clasa a III-a";
  } else if (/clasa a iv-a|clasa a 4-a/i.test(lower)) {
    q.grade = "Clasa a IV-a";
  }

  if (/matematic/i.test(lower)) q.subject = "Matematică";
  if (/român|limba română/i.test(lower)) q.subject = "Limba română";

  if (/cooperativ|perechi|grup|colabor/i.test(lower)) {
    q.strategy = "cooperative";
  }

  if (/activitat|activităț/i.test(lower)) q.kind = "learning_activity";
  else if (/evaluar|assessment|test|rubric/i.test(lower)) {
    q.kind = "assessment_method";
  } else if (/șablon|template/i.test(lower)) q.kind = "template";
  else if (/reflec/i.test(lower)) q.kind = "reflection_note";
  else if (/lecț/i.test(lower)) q.kind = "lesson_design";

  return q;
}

export function searchKnowledge(
  nodes: KnowledgeNode[],
  query: KnowledgeSearchQuery,
): KnowledgeSearchHit[] {
  const text = (query.text ?? "").trim().toLowerCase();
  const hits: KnowledgeSearchHit[] = [];

  for (const node of nodes) {
    if (query.subject && node.subject && node.subject !== query.subject) {
      continue;
    }
    if (query.grade && node.grade && node.grade !== query.grade) continue;
    if (query.kind && node.kind !== query.kind) continue;
    if (query.strategy && node.strategy !== query.strategy) {
      if (!node.tags.some((t) => t.includes(query.strategy!))) continue;
    }
    if (query.bloomLevel && node.bloomLevel !== query.bloomLevel) continue;
    if (
      query.maxMinutes != null &&
      node.estimatedMinutes != null &&
      node.estimatedMinutes > query.maxMinutes
    ) {
      continue;
    }
    if (query.competency) {
      const hay = [
        ...(node.competencyIds ?? []),
        ...node.tags,
        node.title,
        node.summary,
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(query.competency.toLowerCase())) continue;
    }
    if (query.tags?.length) {
      const has = query.tags.every((t) =>
        node.tags.some((nt) => nt.toLowerCase().includes(t.toLowerCase())),
      );
      if (!has) continue;
    }

    let score = 1;
    const blob = `${node.title} ${node.summary} ${node.tags.join(" ")}`.toLowerCase();
    if (text) {
      if (blob.includes(text)) score += 8;
      else {
        const tokens = text.split(/\s+/).filter((t) => t.length > 2);
        const matched = tokens.filter((t) => blob.includes(t)).length;
        if (matched === 0) continue;
        score += matched * 2;
      }
    }

    if (query.strategy && node.strategy === query.strategy) score += 4;
    if (query.grade && node.grade === query.grade) score += 3;
    if (query.subject && node.subject === query.subject) score += 3;

    hits.push({
      nodeId: node.id,
      title: node.title,
      kind: node.kind,
      score,
      excerpt: node.summary.slice(0, 140),
    });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, 40);
}
