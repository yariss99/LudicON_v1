import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import {
  DEFAULT_ASSESSMENT_BLOCKS,
  DEFAULT_AUTHOR,
  assessmentBlockLabel,
  estimateDurationMinutes,
} from "../constants";
import type {
  AssessmentBlock,
  AssessmentBlockType,
  AssessmentStudioDocument,
  AssessmentStudioProperties,
  AssessmentSummary,
} from "../types";

const KEY = "prima.assessment-studio.assessments.v1";

function read(): AssessmentStudioDocument[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssessmentStudioDocument[];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function write(items: AssessmentStudioDocument[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function emptyProperties(
  overrides: Partial<AssessmentStudioProperties> = {},
): AssessmentStudioProperties {
  return {
    title: "Untitled assessment",
    subject: "",
    grade: "",
    purpose: "formative",
    competencies: [],
    durationMinutes: 20,
    instructions: "",
    ...overrides,
  };
}

export function buildAssessmentSummary(
  doc: Pick<AssessmentStudioDocument, "properties" | "blocks">,
): AssessmentSummary {
  const fromBlocks = new Set<string>();
  for (const block of doc.blocks) {
    for (const c of block.competencyIds ?? []) {
      if (c.trim()) fromBlocks.add(c.trim());
    }
  }
  for (const c of doc.properties.competencies ?? []) {
    if (c.trim()) fromBlocks.add(c.trim());
  }
  const targeted = [...fromBlocks];
  const estimated = estimateDurationMinutes(
    doc.blocks,
    doc.properties.durationMinutes || 20,
  );
  return {
    targetedCompetencies: targeted,
    purpose: doc.properties.purpose,
    itemCount: doc.blocks.length,
    estimatedDurationMinutes: estimated,
    updatedAt: nowIso(),
  };
}

export function createAssessmentBlock(
  type: AssessmentBlockType,
  order: number,
  competencyIds: string[] = [],
): AssessmentBlock {
  return {
    id: createId("ablk"),
    type,
    title: assessmentBlockLabel(type),
    content: "",
    collapsed: false,
    order,
    competencyIds,
    aiHintDismissed: false,
  };
}

export function createDefaultAssessmentBlocks(
  seedCompetencies: string[] = [],
): AssessmentBlock[] {
  const seed = seedCompetencies.slice(0, 1);
  return DEFAULT_ASSESSMENT_BLOCKS.map((type, order) =>
    createAssessmentBlock(type, order, seed),
  );
}

function normalize(doc: AssessmentStudioDocument): AssessmentStudioDocument {
  const properties = {
    ...emptyProperties(),
    ...doc.properties,
    competencies: doc.properties?.competencies ?? [],
  };
  const blocks = (doc.blocks ?? []).map((b, order) => ({
    ...b,
    content: b.content ?? "",
    collapsed: Boolean(b.collapsed),
    order,
    competencyIds: b.competencyIds ?? [],
    aiHintDismissed: Boolean(b.aiHintDismissed),
  }));
  const draft = { properties, blocks };
  return {
    ...doc,
    guidedCompleted: Boolean(doc.guidedCompleted),
    properties,
    blocks,
    summary: doc.summary ?? buildAssessmentSummary(draft),
  };
}

class AssessmentStudioRepository {
  list(): AssessmentStudioDocument[] {
    return read().sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  }

  listByProject(projectId: string): AssessmentStudioDocument[] {
    return this.list().filter((a) => a.projectId === projectId);
  }

  getById(id: string): AssessmentStudioDocument | undefined {
    return read().find((a) => a.id === id);
  }

  create(
    projectId: string,
    seed?: Partial<AssessmentStudioProperties> & {
      author?: string;
      projectCompetencies?: string[];
    },
  ): AssessmentStudioDocument {
    const timestamp = nowIso();
    const properties = emptyProperties({
      title: seed?.title ?? "Untitled assessment",
      subject: seed?.subject ?? "",
      grade: seed?.grade ?? "",
      purpose: seed?.purpose ?? "formative",
      competencies: seed?.competencies ?? seed?.projectCompetencies ?? [],
      durationMinutes: seed?.durationMinutes ?? 20,
      instructions: seed?.instructions ?? "",
    });
    const blocks = createDefaultAssessmentBlocks(
      seed?.projectCompetencies ?? properties.competencies,
    );
    const draft = { properties, blocks };
    const doc: AssessmentStudioDocument = {
      id: createId("as"),
      projectId,
      status: "draft",
      version: 1,
      properties,
      blocks,
      summary: buildAssessmentSummary(draft),
      guidedCompleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      author: seed?.author ?? DEFAULT_AUTHOR,
    };
    write([doc, ...read()]);
    return doc;
  }

  save(doc: AssessmentStudioDocument): AssessmentStudioDocument {
    const normalized = normalize(doc);
    const next = {
      ...normalized,
      summary: buildAssessmentSummary(normalized),
      updatedAt: nowIso(),
    };
    const all = read();
    const index = all.findIndex((item) => item.id === next.id);
    if (index === -1) write([next, ...all]);
    else {
      const copy = [...all];
      copy[index] = next;
      write(copy);
    }
    return next;
  }

  duplicate(id: string): AssessmentStudioDocument {
    const source = this.getById(id);
    if (!source) throw new Error("NOT_FOUND");
    const timestamp = nowIso();
    const copy: AssessmentStudioDocument = {
      ...structuredClone(source),
      id: createId("as"),
      status: "draft",
      version: 1,
      guidedCompleted: false,
      properties: {
        ...source.properties,
        title: `${source.properties.title} (copy)`,
      },
      blocks: source.blocks.map((b, order) => ({
        ...b,
        id: createId("ablk"),
        order,
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    copy.summary = buildAssessmentSummary(copy);
    write([copy, ...read()]);
    return copy;
  }

  delete(id: string): void {
    write(read().filter((a) => a.id !== id));
  }
}

export const assessmentStudioRepository = new AssessmentStudioRepository();

export function createAssessmentInStudio(
  projectId: string,
  seed?: Partial<AssessmentStudioProperties> & {
    projectCompetencies?: string[];
  },
): AssessmentStudioDocument {
  return assessmentStudioRepository.create(projectId, seed);
}
