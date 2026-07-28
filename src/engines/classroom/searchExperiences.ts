import type {
  ClassFeedbackNote,
  ClassroomSearchHit,
  ClassroomSearchQuery,
  ExperienceVersion,
  SearchFacet,
} from "../../types/classroom";

function latestByProject(
  versions: ExperienceVersion[],
): Map<string, ExperienceVersion> {
  const map = new Map<string, ExperienceVersion>();
  for (const version of versions) {
    const current = map.get(version.projectId);
    if (!current || version.version > current.version) {
      map.set(version.projectId, version);
    }
  }
  return map;
}

function includesLoose(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

/**
 * Search teacher experience memory by competency, topic, method,
 * resource, school year, and class-level feedback patterns.
 */
export function searchExperiences(
  versions: ExperienceVersion[],
  feedback: ClassFeedbackNote[],
  query: ClassroomSearchQuery,
): ClassroomSearchHit[] {
  const latest = latestByProject(versions);
  const text = query.text.trim();

  const hits: ClassroomSearchHit[] = [];

  for (const version of latest.values()) {
    const notes = feedback.filter((f) => f.projectId === version.projectId);
    const matchedOn: SearchFacet[] = [];

    const blob = [
      version.title,
      version.subject,
      ...version.topics,
      ...version.competencies,
      ...version.methods,
      ...version.resources.map((r) => r.label),
      ...notes.map((n) => n.pattern),
    ].join(" ");

    if (text && includesLoose(blob, text)) {
      // facet inferred below; mark soft matches
      if (version.topics.some((t) => includesLoose(t, text))) {
        matchedOn.push("topic");
      }
      if (version.competencies.some((c) => includesLoose(c, text))) {
        matchedOn.push("competency");
      }
      if (version.methods.some((m) => includesLoose(m, text))) {
        matchedOn.push("method");
      }
      if (version.resources.some((r) => includesLoose(r.label, text))) {
        matchedOn.push("resource");
      }
      if (notes.some((n) => includesLoose(n.pattern, text))) {
        matchedOn.push("feedback");
      }
      if (matchedOn.length === 0) matchedOn.push("topic");
    }

    if (query.competency) {
      if (
        !version.competencies.some((c) => includesLoose(c, query.competency!))
      ) {
        continue;
      }
      matchedOn.push("competency");
    }
    if (query.topic) {
      if (!version.topics.some((t) => includesLoose(t, query.topic!))) {
        continue;
      }
      matchedOn.push("topic");
    }
    if (query.method) {
      if (!version.methods.some((m) => includesLoose(m, query.method!))) {
        continue;
      }
      matchedOn.push("method");
    }
    if (query.resource) {
      if (
        !version.resources.some((r) => includesLoose(r.label, query.resource!))
      ) {
        continue;
      }
      matchedOn.push("resource");
    }
    if (query.schoolYear) {
      if (!includesLoose(version.schoolYear, query.schoolYear)) continue;
      matchedOn.push("school_year");
    }
    if (query.feedback) {
      if (!notes.some((n) => n.sentiment === query.feedback)) continue;
      matchedOn.push("feedback");
    }

    const hasFilters =
      Boolean(text) ||
      Boolean(query.competency) ||
      Boolean(query.topic) ||
      Boolean(query.method) ||
      Boolean(query.resource) ||
      Boolean(query.schoolYear) ||
      Boolean(query.feedback);

    if (hasFilters && matchedOn.length === 0) continue;
    if (text && !includesLoose(blob, text)) continue;

    hits.push({
      projectId: version.projectId,
      title: version.title,
      subject: version.subject,
      grade: version.grade,
      schoolYear: version.schoolYear,
      topics: version.topics,
      competencies: version.competencies,
      methods: version.methods,
      matchedOn: [...new Set(matchedOn)],
      latestVersionId: version.id,
      feedbackPreview: notes[0]?.pattern,
    });
  }

  return hits.sort((a, b) => a.title.localeCompare(b.title));
}

export function uniqueFacets(versions: ExperienceVersion[]) {
  const competencies = new Set<string>();
  const topics = new Set<string>();
  const methods = new Set<string>();
  const resources = new Set<string>();
  const schoolYears = new Set<string>();

  for (const version of versions) {
    version.competencies.forEach((c) => competencies.add(c));
    version.topics.forEach((t) => topics.add(t));
    version.methods.forEach((m) => methods.add(m));
    version.resources.forEach((r) => resources.add(r.label));
    schoolYears.add(version.schoolYear);
  }

  return {
    competencies: [...competencies].sort(),
    topics: [...topics].sort(),
    methods: [...methods].sort(),
    resources: [...resources].sort(),
    schoolYears: [...schoolYears].sort(),
  };
}
