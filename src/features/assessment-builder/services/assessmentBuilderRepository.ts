import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  AssessmentActor,
  AssessmentDocument,
  AssessmentKind,
  AssessmentQuestion,
  AssessmentRubric,
  AssessmentScoring,
  AssessmentValidationReport,
  AssessmentVersion,
  QuestionGroup,
} from "../types";
import { computeAssessmentAnalytics } from "./assessmentAnalytics";

const ASSESSMENTS_KEY = "prima.assessment-builder.assessments.v1";
const VERSIONS_KEY = "prima.assessment-builder.versions.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultScoring(): AssessmentScoring {
  return {
    mode: "automatic",
    totalPoints: 0,
    passingScore: 50,
    weights: {},
  };
}

export function createEmptyAssessment(input: {
  projectId: string;
  lessonId: string;
  title?: string;
  subject?: string;
  grade?: string;
  kind?: AssessmentKind;
  createdBy?: AssessmentActor;
}): AssessmentDocument {
  const now = nowIso();
  if (!input.projectId.trim() || !input.lessonId.trim()) {
    throw new Error("Assessment requires both projectId and lessonId");
  }
  return {
    id: createId("assess"),
    projectId: input.projectId,
    lessonId: input.lessonId,
    kind: input.kind ?? "formative",
    status: "draft",
    version: 1,
    title: input.title?.trim() || "Evaluare nouă",
    subject: input.subject ?? "",
    grade: input.grade ?? "",
    durationMinutes: 20,
    objectives: [],
    competencies: [],
    criteria: [],
    groups: [
      {
        id: createId("agroup"),
        title: "Grup 1",
        instructions: "Răspunde la itemi.",
        questions: [],
        order: 0,
      },
    ],
    scoring: defaultScoring(),
    rubrics: [],
    teacherNotes: "",
    metadata: {
      locale: "ro-RO",
      schema: "assessment-builder/1.0",
    },
    bank: [],
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy ?? "teacher",
  };
}

function recordVersion(
  doc: AssessmentDocument,
  actor: AssessmentActor,
  note?: string,
): AssessmentVersion {
  const entry: AssessmentVersion = {
    id: createId("aver"),
    assessmentId: doc.id,
    projectId: doc.projectId,
    lessonId: doc.lessonId,
    version: doc.version,
    snapshot: doc,
    createdAt: nowIso(),
    actor,
    note,
  };
  const all = load<AssessmentVersion[]>(VERSIONS_KEY, []);
  all.unshift(entry);
  save(VERSIONS_KEY, all.slice(0, 3000));
  return entry;
}

function withDerived(doc: AssessmentDocument): AssessmentDocument {
  const questions = doc.groups.flatMap((g) => g.questions);
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  return {
    ...doc,
    scoring: {
      ...doc.scoring,
      totalPoints,
    },
    analytics: computeAssessmentAnalytics(doc),
  };
}

export const assessmentBuilderRepository = {
  listByProject(projectId: string): AssessmentDocument[] {
    return load<AssessmentDocument[]>(ASSESSMENTS_KEY, [])
      .filter((a) => a.projectId === projectId && a.status !== "archived")
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  },

  listByLesson(projectId: string, lessonId: string): AssessmentDocument[] {
    return this.listByProject(projectId).filter((a) => a.lessonId === lessonId);
  },

  getById(id: string): AssessmentDocument | undefined {
    return load<AssessmentDocument[]>(ASSESSMENTS_KEY, []).find(
      (a) => a.id === id,
    );
  },

  create(input: {
    projectId: string;
    lessonId: string;
    title?: string;
    subject?: string;
    grade?: string;
    kind?: AssessmentKind;
    createdBy?: AssessmentActor;
    seed?: Partial<AssessmentDocument>;
  }): AssessmentDocument {
    const base = createEmptyAssessment(input);
    const doc = withDerived({
      ...base,
      ...input.seed,
      id: base.id,
      projectId: input.projectId,
      lessonId: input.lessonId,
      version: 1,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
      createdBy: input.createdBy ?? "teacher",
      status: input.seed?.status ?? "draft",
    });
    const all = load<AssessmentDocument[]>(ASSESSMENTS_KEY, []);
    all.push(doc);
    save(ASSESSMENTS_KEY, all);
    recordVersion(doc, doc.createdBy, "create");
    return doc;
  },

  save(
    doc: AssessmentDocument,
    options?: { actor?: AssessmentActor; note?: string; bumpVersion?: boolean },
  ): AssessmentDocument {
    if (!doc.projectId || !doc.lessonId) {
      throw new Error("Assessment must belong to a lesson and a project");
    }
    const all = load<AssessmentDocument[]>(ASSESSMENTS_KEY, []);
    const idx = all.findIndex((a) => a.id === doc.id);
    if (idx < 0) throw new Error(`Assessment not found: ${doc.id}`);
    if (all[idx]!.projectId !== doc.projectId) {
      throw new Error("Assessment project mismatch");
    }
    const bump = options?.bumpVersion !== false;
    const next = withDerived({
      ...doc,
      version: bump ? doc.version + 1 : doc.version,
      updatedAt: nowIso(),
    });
    all[idx] = next;
    save(ASSESSMENTS_KEY, all);
    if (bump) {
      recordVersion(next, options?.actor ?? "teacher", options?.note ?? "save");
    }
    return next;
  },

  duplicate(id: string): AssessmentDocument {
    const source = this.getById(id);
    if (!source) throw new Error(`Assessment not found: ${id}`);
    return this.create({
      projectId: source.projectId,
      lessonId: source.lessonId,
      title: `${source.title} (copie)`,
      subject: source.subject,
      grade: source.grade,
      kind: source.kind,
      seed: {
        ...source,
        title: `${source.title} (copie)`,
        status: "draft",
        publishedAt: undefined,
        validation: undefined,
        groups: source.groups.map((g, gi) => ({
          ...g,
          id: createId("agroup"),
          order: gi,
          questions: g.questions.map((q, qi) => ({
            ...q,
            id: createId("aq"),
            order: qi,
            choices: q.choices?.map((c) => ({ ...c, id: createId("ach") })),
          })),
        })),
        rubrics: source.rubrics.map((r) => ({
          ...r,
          id: createId("arub"),
          criteria: r.criteria.map((c) => ({
            ...c,
            id: createId("arc"),
            levels: c.levels.map((l) => ({ ...l, id: createId("arl") })),
          })),
        })),
        bank: source.bank.map((q, i) => ({
          ...q,
          id: createId("aq"),
          order: i,
        })),
      },
    });
  },

  archive(id: string): AssessmentDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Assessment not found: ${id}`);
    return this.save(
      { ...doc, status: "archived" },
      { note: "archive", actor: "teacher" },
    );
  },

  listVersions(assessmentId: string): AssessmentVersion[] {
    return load<AssessmentVersion[]>(VERSIONS_KEY, []).filter(
      (v) => v.assessmentId === assessmentId,
    );
  },

  getVersion(versionId: string): AssessmentVersion | undefined {
    return load<AssessmentVersion[]>(VERSIONS_KEY, []).find(
      (v) => v.id === versionId,
    );
  },

  compareVersions(aId: string, bId: string): {
    a?: AssessmentVersion;
    b?: AssessmentVersion;
  } {
    return { a: this.getVersion(aId), b: this.getVersion(bId) };
  },

  restoreVersion(versionId: string): AssessmentDocument {
    const entry = this.getVersion(versionId);
    if (!entry) throw new Error(`Version not found: ${versionId}`);
    const current = this.getById(entry.assessmentId);
    if (!current) throw new Error("Current assessment missing");
    return this.save(
      {
        ...entry.snapshot,
        id: current.id,
        projectId: current.projectId,
        lessonId: current.lessonId,
        workspaceArtifactId: current.workspaceArtifactId,
        status: current.status === "archived" ? "draft" : current.status,
        version: current.version,
      },
      { note: `restore v${entry.version}`, actor: "teacher" },
    );
  },

  setValidation(
    id: string,
    report: AssessmentValidationReport,
  ): AssessmentDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Assessment not found: ${id}`);
    return this.save(
      {
        ...doc,
        validation: report,
        status: report.passed
          ? doc.status === "published"
            ? "published"
            : "validated"
          : "draft",
      },
      { actor: "system", note: "validation" },
    );
  },

  publish(id: string): AssessmentDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Assessment not found: ${id}`);
    if (!doc.validation?.passed) {
      throw new Error("Assessment must pass Validation Engine before publish");
    }
    return this.save(
      { ...doc, status: "published", publishedAt: nowIso() },
      { actor: "teacher", note: "publish" },
    );
  },

  recountPoints(groups: readonly QuestionGroup[]): number {
    return groups
      .flatMap((g) => g.questions)
      .reduce((sum, q) => sum + q.points, 0);
  },
};

export function createBlankQuestion(
  type: AssessmentQuestion["type"],
  order: number,
): AssessmentQuestion {
  return {
    id: createId("aq"),
    type,
    prompt: "",
    points: type === "multiple_choice" ? 1 : 2,
    difficulty: "medium",
    bloom: "understand",
    competencyIds: [],
    estimatedSeconds: 60,
    order,
    choices:
      type === "multiple_choice"
        ? [
            { id: createId("ach"), label: "A", isCorrect: true },
            { id: createId("ach"), label: "B", isCorrect: false },
            { id: createId("ach"), label: "C", isCorrect: false },
            { id: createId("ach"), label: "D", isCorrect: false },
          ]
        : undefined,
  };
}

export function createBlankRubric(): AssessmentRubric {
  return {
    id: createId("arub"),
    title: "Rubrică nouă",
    criteria: [
      {
        id: createId("arc"),
        title: "Criteriu 1",
        description: "Descriere scurtă",
        weight: 1,
        levels: [
          {
            id: createId("arl"),
            label: "Începător",
            description: "Abordare parțială",
            points: 1,
          },
          {
            id: createId("arl"),
            label: "Competent",
            description: "Răspuns corect și clar",
            points: 2,
          },
          {
            id: createId("arl"),
            label: "Avansat",
            description: "Răspuns profund și transferabil",
            points: 3,
          },
        ],
      },
    ],
  };
}
