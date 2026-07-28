import type {
  KnowledgeResource,
  ResourceSearchFilters,
  ResourceSearchHit,
} from "../types";

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / (A.size + B.size - inter);
}

function bag(resource: KnowledgeResource): string[] {
  return normalize(
    [
      resource.name,
      resource.description,
      resource.subject,
      resource.grade,
      resource.author,
      resource.assetType,
      resource.contentPreview ?? "",
      resource.ai.summary ?? "",
      resource.ai.embeddingsHint ?? "",
      ...resource.tags,
      ...resource.competencies,
      ...resource.learningObjectives,
      ...resource.curriculumRefs,
      ...resource.ai.keywords,
    ].join(" "),
  );
}

function passesFilters(
  resource: KnowledgeResource,
  filters: ResourceSearchFilters,
): boolean {
  if (filters.projectId && resource.projectId !== filters.projectId) {
    return false;
  }
  if (filters.lessonId && resource.lessonId !== filters.lessonId) {
    return false;
  }
  if (
    filters.assetTypes.length &&
    !filters.assetTypes.includes(resource.assetType)
  ) {
    return false;
  }
  if (
    filters.subjects.length &&
    !filters.subjects.some(
      (s) => resource.subject.toLowerCase() === s.toLowerCase(),
    )
  ) {
    return false;
  }
  if (
    filters.grades.length &&
    !filters.grades.some(
      (g) => resource.grade.toLowerCase() === g.toLowerCase(),
    )
  ) {
    return false;
  }
  if (
    filters.author &&
    !resource.author.toLowerCase().includes(filters.author.toLowerCase())
  ) {
    return false;
  }
  if (
    filters.tags.length &&
    !filters.tags.every((t) =>
      resource.tags.some((rt) => rt.toLowerCase().includes(t.toLowerCase())),
    )
  ) {
    return false;
  }
  if (
    filters.competency &&
    !resource.competencies.some((c) =>
      c.toLowerCase().includes(filters.competency!.toLowerCase()),
    )
  ) {
    return false;
  }
  if (
    filters.objective &&
    !resource.learningObjectives.some((o) =>
      o.toLowerCase().includes(filters.objective!.toLowerCase()),
    )
  ) {
    return false;
  }
  if (filters.difficulty && resource.difficulty !== filters.difficulty) {
    return false;
  }
  if (filters.shareScope && resource.shareScope !== filters.shareScope) {
    return false;
  }
  if (filters.dateFrom && resource.updatedAt < filters.dateFrom) return false;
  if (filters.dateTo && resource.updatedAt > filters.dateTo) return false;
  if (
    filters.minMinutes != null &&
    (resource.estimatedMinutes ?? 0) < filters.minMinutes
  ) {
    return false;
  }
  if (
    filters.maxMinutes != null &&
    (resource.estimatedMinutes ?? 999) > filters.maxMinutes
  ) {
    return false;
  }
  return true;
}

export function searchResources(
  resources: readonly KnowledgeResource[],
  filters: ResourceSearchFilters,
): ResourceSearchHit[] {
  const q = filters.query.trim();
  const qTokens = normalize(q);
  const hits: ResourceSearchHit[] = [];

  for (const resource of resources) {
    if (resource.archived) continue;
    if (!passesFilters(resource, filters)) continue;

    const reasons: string[] = [];
    let score = 0.15;

    if (!q) {
      score += Math.min(0.3, resource.usage.reuseCount * 0.05);
      score += resource.favorite ? 0.1 : 0;
      hits.push({ resource, score, reasons: ["browse"] });
      continue;
    }

    const hay = bag(resource);
    const nameTokens = normalize(resource.name);

    if (resource.name.toLowerCase().includes(q.toLowerCase())) {
      score += 0.55;
      reasons.push("titlu");
    }
    if (resource.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))) {
      score += 0.25;
      reasons.push("tag");
    }
    if (
      resource.competencies.some((c) =>
        c.toLowerCase().includes(q.toLowerCase()),
      )
    ) {
      score += 0.3;
      reasons.push("competență");
    }
    if (
      resource.learningObjectives.some((o) =>
        o.toLowerCase().includes(q.toLowerCase()),
      )
    ) {
      score += 0.28;
      reasons.push("obiectiv");
    }

    const keywordOverlap = jaccard(qTokens, hay);
    if (filters.semantic || filters.naturalLanguage) {
      score += keywordOverlap * 0.7;
      if (keywordOverlap > 0.08) reasons.push("similaritate semantică");
      const nameOverlap = jaccard(qTokens, nameTokens);
      score += nameOverlap * 0.35;
    } else {
      score += keywordOverlap * 0.4;
      if (keywordOverlap > 0.12) reasons.push("cuvinte cheie");
    }

    if (filters.naturalLanguage) {
      const intentWords = ["lipsește", "similar", "reutilizează", "recomandă"];
      if (intentWords.some((w) => q.toLowerCase().includes(w))) {
        score += 0.08;
        reasons.push("intent NL");
      }
    }

    if (score >= 0.22) {
      hits.push({
        resource,
        score: Math.min(1, score),
        reasons: reasons.length ? reasons : ["potrivire"],
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score);
}

export function findSimilar(
  resource: KnowledgeResource,
  corpus: readonly KnowledgeResource[],
  limit = 8,
): ResourceSearchHit[] {
  const base = bag(resource);
  return corpus
    .filter((r) => r.id !== resource.id && !r.archived)
    .map((r) => {
      const score = jaccard(base, bag(r));
      const sameSubject =
        r.subject && r.subject === resource.subject ? 0.12 : 0;
      const sameGrade = r.grade && r.grade === resource.grade ? 0.08 : 0;
      const sameType = r.assetType === resource.assetType ? 0.1 : 0;
      return {
        resource: r,
        score: Math.min(1, score + sameSubject + sameGrade + sameType),
        reasons: ["similaritate"],
      };
    })
    .filter((h) => h.score > 0.12)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function detectDuplicates(
  corpus: readonly KnowledgeResource[],
  threshold = 0.72,
): { a: KnowledgeResource; b: KnowledgeResource; score: number }[] {
  const active = corpus.filter((r) => !r.archived);
  const pairs: { a: KnowledgeResource; b: KnowledgeResource; score: number }[] =
    [];
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const a = active[i]!;
      const b = active[j]!;
      if (a.assetType !== b.assetType) continue;
      const score = jaccard(bag(a), bag(b));
      if (score >= threshold) pairs.push({ a, b, score });
    }
  }
  return pairs.sort((x, y) => y.score - x.score).slice(0, 20);
}

export const emptyFilters = (
  overrides?: Partial<ResourceSearchFilters>,
): ResourceSearchFilters => ({
  query: "",
  assetTypes: [],
  subjects: [],
  grades: [],
  tags: [],
  semantic: false,
  naturalLanguage: false,
  ...overrides,
});
