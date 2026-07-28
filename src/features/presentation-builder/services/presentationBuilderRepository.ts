import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  PresentationActor,
  PresentationDocument,
  PresentationKind,
  PresentationSlide,
  PresentationSourceRef,
  PresentationThemeId,
  PresentationValidationReport,
  PresentationVersion,
  SlideType,
} from "../types";

const PRESENTATIONS_KEY = "prima.presentation-builder.presentations.v1";
const VERSIONS_KEY = "prima.presentation-builder.versions.v1";

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

function estimateMinutes(slides: readonly PresentationSlide[]): number {
  const seconds = slides.reduce((sum, s) => sum + (s.estimatedSeconds || 45), 0);
  return Math.max(5, Math.round(seconds / 60) || 5);
}

export function createEmptyPresentation(input: {
  projectId: string;
  lessonId?: string;
  title?: string;
  subject?: string;
  grade?: string;
  kind?: PresentationKind;
  source?: PresentationSourceRef;
  themeId?: PresentationThemeId;
  createdBy?: PresentationActor;
}): PresentationDocument {
  if (!input.projectId.trim()) {
    throw new Error("Presentation requires projectId");
  }
  const now = nowIso();
  return {
    id: createId("pres"),
    projectId: input.projectId,
    lessonId: input.lessonId,
    kind: input.kind ?? "lesson",
    status: "draft",
    version: 1,
    title: input.title?.trim() || "Prezentare nouă",
    subject: input.subject ?? "",
    grade: input.grade ?? "",
    locale: "ro-RO",
    source: input.source ?? {
      kind: "template",
      label: "Șablon prezentare PRIMA",
    },
    themeId: input.themeId ?? "atelier_calm",
    objectives: [],
    competencies: [],
    slides: [],
    teacherNotes: "",
    metadata: { schema: "presentation-builder/1.0" },
    estimatedMinutes: 10,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy ?? "teacher",
  };
}

function recordVersion(
  doc: PresentationDocument,
  actor: PresentationActor,
  note?: string,
): PresentationVersion {
  const entry: PresentationVersion = {
    id: createId("pver"),
    presentationId: doc.id,
    projectId: doc.projectId,
    version: doc.version,
    snapshot: doc,
    createdAt: nowIso(),
    actor,
    note,
  };
  const all = load<PresentationVersion[]>(VERSIONS_KEY, []);
  all.unshift(entry);
  save(VERSIONS_KEY, all.slice(0, 3000));
  return entry;
}

function withDerived(doc: PresentationDocument): PresentationDocument {
  return {
    ...doc,
    estimatedMinutes: estimateMinutes(doc.slides),
  };
}

export const presentationBuilderRepository = {
  listByProject(projectId: string): PresentationDocument[] {
    return load<PresentationDocument[]>(PRESENTATIONS_KEY, [])
      .filter((p) => p.projectId === projectId && p.status !== "archived")
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  },

  getById(id: string): PresentationDocument | undefined {
    return load<PresentationDocument[]>(PRESENTATIONS_KEY, []).find(
      (p) => p.id === id,
    );
  },

  create(input: {
    projectId: string;
    lessonId?: string;
    title?: string;
    subject?: string;
    grade?: string;
    kind?: PresentationKind;
    source?: PresentationSourceRef;
    themeId?: PresentationThemeId;
    createdBy?: PresentationActor;
    seed?: Partial<PresentationDocument>;
  }): PresentationDocument {
    const base = createEmptyPresentation(input);
    const doc = withDerived({
      ...base,
      ...input.seed,
      id: base.id,
      projectId: input.projectId,
      lessonId: input.lessonId ?? input.seed?.lessonId,
      version: 1,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
      createdBy: input.createdBy ?? "teacher",
      status: input.seed?.status ?? "draft",
      source: input.seed?.source ?? input.source ?? base.source,
    });
    const all = load<PresentationDocument[]>(PRESENTATIONS_KEY, []);
    all.push(doc);
    save(PRESENTATIONS_KEY, all);
    recordVersion(doc, doc.createdBy, "create");
    return doc;
  },

  save(
    doc: PresentationDocument,
    options?: {
      actor?: PresentationActor;
      note?: string;
      bumpVersion?: boolean;
    },
  ): PresentationDocument {
    if (!doc.projectId) throw new Error("Presentation requires projectId");
    const all = load<PresentationDocument[]>(PRESENTATIONS_KEY, []);
    const idx = all.findIndex((p) => p.id === doc.id);
    if (idx < 0) throw new Error(`Presentation not found: ${doc.id}`);
    if (all[idx]!.projectId !== doc.projectId) {
      throw new Error("Presentation project mismatch");
    }
    const bump = options?.bumpVersion !== false;
    const next = withDerived({
      ...doc,
      version: bump ? doc.version + 1 : doc.version,
      updatedAt: nowIso(),
    });
    all[idx] = next;
    save(PRESENTATIONS_KEY, all);
    if (bump) {
      recordVersion(next, options?.actor ?? "teacher", options?.note ?? "save");
    }
    return next;
  },

  duplicate(id: string): PresentationDocument {
    const source = this.getById(id);
    if (!source) throw new Error(`Presentation not found: ${id}`);
    return this.create({
      projectId: source.projectId,
      lessonId: source.lessonId,
      title: `${source.title} (copie)`,
      subject: source.subject,
      grade: source.grade,
      kind: source.kind,
      source: source.source,
      themeId: source.themeId,
      seed: {
        ...source,
        title: `${source.title} (copie)`,
        status: "draft",
        publishedAt: undefined,
        validation: undefined,
        slides: source.slides.map((s, i) => ({
          ...s,
          id: createId("pslide"),
          order: i,
        })),
      },
    });
  },

  archive(id: string): PresentationDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Presentation not found: ${id}`);
    return this.save(
      { ...doc, status: "archived" },
      { note: "archive", actor: "teacher" },
    );
  },

  listVersions(presentationId: string): PresentationVersion[] {
    return load<PresentationVersion[]>(VERSIONS_KEY, []).filter(
      (v) => v.presentationId === presentationId,
    );
  },

  getVersion(versionId: string): PresentationVersion | undefined {
    return load<PresentationVersion[]>(VERSIONS_KEY, []).find(
      (v) => v.id === versionId,
    );
  },

  restoreVersion(versionId: string): PresentationDocument {
    const entry = this.getVersion(versionId);
    if (!entry) throw new Error(`Version not found: ${versionId}`);
    const current = this.getById(entry.presentationId);
    if (!current) throw new Error("Current presentation missing");
    return this.save(
      {
        ...entry.snapshot,
        id: current.id,
        projectId: current.projectId,
        workspaceArtifactId: current.workspaceArtifactId,
        status: current.status === "archived" ? "draft" : current.status,
        version: current.version,
      },
      { note: `restore v${entry.version}`, actor: "teacher" },
    );
  },

  publish(id: string): PresentationDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Presentation not found: ${id}`);
    if (!doc.validation?.passed) {
      throw new Error(
        "Presentation must pass Validation Engine before publish",
      );
    }
    return this.save(
      { ...doc, status: "published", publishedAt: nowIso() },
      { actor: "teacher", note: "publish" },
    );
  },

  setValidation(
    id: string,
    report: PresentationValidationReport,
  ): PresentationDocument {
    const doc = this.getById(id);
    if (!doc) throw new Error(`Presentation not found: ${id}`);
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
};

export function createBlankSlide(
  type: SlideType,
  order: number,
): PresentationSlide {
  return {
    id: createId("pslide"),
    type,
    title: "Slide nou",
    body: "",
    bullets: [],
    speakerNotes: "",
    media: [],
    estimatedSeconds: type === "title" ? 20 : 45,
    order,
  };
}
