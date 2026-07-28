import { createId } from "../../../utils/id";
import type { Project } from "../../../types/project";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { assessmentBuilderRepository } from "../../assessment-builder/services/assessmentBuilderRepository";
import { storyBuilderRepository } from "../../story-builder/services/storyBuilderRepository";
import { gameBuilderRepository } from "../../game-builder/services/gameBuilderRepository";
import { presentationBuilderRepository } from "../../presentation-builder/services/presentationBuilderRepository";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import type {
  KnowledgeResource,
  ResourceAssetType,
  ResourceRelation,
} from "../types";
import { resourceCenterRepository } from "./resourceCenterRepository";

function stableId(assetType: ResourceAssetType, sourceId: string): string {
  return `rc:${assetType}:${sourceId}`;
}

function rel(
  kind: ResourceRelation["kind"],
  targetId: string,
  targetLabel: string,
  strength = 0.8,
): ResourceRelation {
  return {
    id: createId("rcrel"),
    kind,
    targetId,
    targetLabel,
    strength,
  };
}

function tokenize(...parts: string[]): string[] {
  const stop = new Set([
    "și",
    "sau",
    "pentru",
    "din",
    "ale",
    "unei",
    "cu",
    "la",
    "de",
    "the",
    "and",
    "for",
  ]);
  const bag = parts
    .join(" ")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !stop.has(t));
  return Array.from(new Set(bag)).slice(0, 24);
}

function autoTags(input: {
  subject: string;
  grade: string;
  assetType: ResourceAssetType;
  extra?: readonly string[];
}): string[] {
  return Array.from(
    new Set(
      [
        input.assetType,
        input.subject.toLowerCase(),
        input.grade.toLowerCase(),
        ...(input.extra ?? []),
      ].filter(Boolean),
    ),
  );
}

function fromLesson(
  L: NonNullable<ReturnType<typeof lessonBuilderRepository.getById>>,
  project: Project,
): KnowledgeResource {
  const keywords = tokenize(
    L.general.title,
    L.general.subject,
    ...L.objectives,
    ...L.competencies,
  );
  return {
    id: stableId("lesson", L.id),
    name: L.general.title,
    description: L.phases.map((p) => p.title).join(" · ") || "Lecție PRIMA",
    assetType: "lesson",
    projectId: project.id,
    projectTitle: project.title,
    subject: L.general.subject || project.subject,
    grade: L.general.grade || project.grade,
    competencies: [...L.competencies],
    learningObjectives: [...L.objectives],
    curriculumRefs: [],
    tags: autoTags({
      subject: L.general.subject || project.subject,
      grade: L.general.grade || project.grade,
      assetType: "lesson",
    }),
    language: "ro-RO",
    createdAt: L.createdAt,
    updatedAt: L.updatedAt,
    author: L.general.author || "Profesor",
    createdBy: L.createdBy,
    version: L.version,
    usage: { openCount: 0, reuseCount: 0 },
    relations: [
      rel("belongs_to_project", project.id, project.title, 1),
      ...L.competencies
        .slice(0, 6)
        .map((c) => rel("supports_competency", `comp:${c}`, c, 0.7)),
      ...L.objectives
        .slice(0, 6)
        .map((o) => rel("covers_objective", `obj:${o}`, o, 0.7)),
    ],
    validationStatus:
      L.status === "validated" || L.status === "published"
        ? "validated"
        : L.status === "draft"
          ? "draft"
          : "unknown",
    ai: {
      summary: `Lecție ${L.general.subject} · ${L.general.grade}`,
      keywords,
      suggestedTags: keywords.slice(0, 8),
      embeddingsHint: keywords.join(" "),
    },
    shareScope: "personal",
    sharePermission: "collaborative",
    estimatedMinutes: L.general.durationMinutes,
    sourceBuilderId: L.id,
    sourceHref: `/lesson-builder/${project.id}/${L.id}`,
    contentPreview: L.phases
      .map((p) => `${p.title}: ${p.content.slice(0, 80)}`)
      .join("\n")
      .slice(0, 500),
    archived: L.status === "archived",
    favorite: false,
    approvalState: "none",
  };
}

function indexProject(project: Project): KnowledgeResource[] {
  const out: KnowledgeResource[] = [];
  const lessons = lessonBuilderRepository.listByProject(project.id);

  for (const lesson of lessons) {
    out.push(fromLesson(lesson, project));
  }

  for (const a of assessmentBuilderRepository.listByProject(project.id)) {
    const lesson = a.lessonId
      ? lessonBuilderRepository.getById(a.lessonId)
      : undefined;
    const keywords = tokenize(a.title, a.subject, ...a.objectives);
    out.push({
      id: stableId("assessment", a.id),
      name: a.title,
      description: a.teacherNotes || "Evaluare PRIMA",
      assetType: "assessment",
      projectId: project.id,
      projectTitle: project.title,
      lessonId: a.lessonId,
      lessonTitle: lesson?.general.title,
      subject: a.subject || project.subject,
      grade: a.grade || project.grade,
      competencies: [...(a.competencies ?? [])],
      learningObjectives: [...(a.objectives ?? [])],
      curriculumRefs: a.metadata?.curriculumRef
        ? [a.metadata.curriculumRef]
        : [],
      tags: autoTags({
        subject: a.subject || project.subject,
        grade: a.grade || project.grade,
        assetType: "assessment",
      }),
      language: "ro-RO",
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      author: "Profesor",
      createdBy: a.createdBy,
      version: a.version,
      usage: { openCount: 0, reuseCount: 0 },
      relations: [
        rel("belongs_to_project", project.id, project.title, 1),
        ...(a.lessonId
          ? [
              rel(
                "belongs_to_lesson",
                stableId("lesson", a.lessonId),
                lesson?.general.title ?? a.lessonId,
                0.95,
              ),
            ]
          : []),
      ],
      validationStatus: a.validation?.passed ? "validated" : "draft",
      ai: {
        summary: `Evaluare · ${a.kind}`,
        keywords,
        suggestedTags: keywords.slice(0, 8),
        embeddingsHint: keywords.join(" "),
      },
      shareScope: "personal",
      sharePermission: "read_only",
      estimatedMinutes: a.durationMinutes,
      difficulty: "medium",
      sourceBuilderId: a.id,
      sourceHref: `/assessment-builder/${project.id}/${a.id}`,
      contentPreview: a.teacherNotes?.slice(0, 400),
      archived: a.status === "archived",
      favorite: false,
      approvalState: "none",
    });
  }

  for (const s of storyBuilderRepository.listByProject(project.id)) {
    const lesson = s.lessonId
      ? lessonBuilderRepository.getById(s.lessonId)
      : undefined;
    const keywords = tokenize(
      s.title,
      s.subject,
      s.storyArc,
      ...s.objectives,
      ...s.vocabulary,
    );
    out.push({
      id: stableId("story", s.id),
      name: s.title,
      description: s.storyArc || s.setting || "Poveste educațională",
      assetType: "story",
      projectId: project.id,
      projectTitle: project.title,
      lessonId: s.lessonId,
      lessonTitle: lesson?.general.title,
      subject: s.subject || project.subject,
      grade: s.grade || project.grade,
      competencies: [...(s.competencies ?? [])],
      learningObjectives: [...(s.objectives ?? [])],
      curriculumRefs: [],
      tags: autoTags({
        subject: s.subject || project.subject,
        grade: s.grade || project.grade,
        assetType: "story",
      }),
      language: "ro-RO",
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      author: "Profesor",
      createdBy: s.createdBy,
      version: s.version,
      usage: { openCount: 0, reuseCount: 0 },
      relations: [
        rel("belongs_to_project", project.id, project.title, 1),
        ...(s.lessonId
          ? [
              rel(
                "belongs_to_lesson",
                stableId("lesson", s.lessonId),
                lesson?.general.title ?? s.lessonId,
              ),
            ]
          : []),
      ],
      validationStatus: s.validation?.passed ? "validated" : "draft",
      ai: {
        summary: s.storyArc?.slice(0, 160) || "Poveste PRIMA",
        keywords,
        suggestedTags: keywords.slice(0, 8),
        embeddingsHint: keywords.join(" "),
      },
      shareScope: "personal",
      sharePermission: "collaborative",
      estimatedMinutes: s.estimatedMinutes,
      sourceBuilderId: s.id,
      sourceHref: `/story-builder/${project.id}/${s.id}`,
      contentPreview: `${s.setting}\n${s.storyArc}`.slice(0, 400),
      archived: s.status === "archived",
      favorite: false,
      approvalState: "none",
    });
  }

  for (const g of gameBuilderRepository.listByProject(project.id)) {
    const lesson = g.lessonId
      ? lessonBuilderRepository.getById(g.lessonId)
      : undefined;
    const keywords = tokenize(g.title, g.subject, ...g.objectives);
    out.push({
      id: stableId("game", g.id),
      name: g.title,
      description: g.rules || "Joc educațional",
      assetType: "game",
      projectId: project.id,
      projectTitle: project.title,
      lessonId: g.lessonId,
      lessonTitle: lesson?.general.title,
      subject: g.subject || project.subject,
      grade: g.grade || project.grade,
      competencies: [...(g.competencies ?? [])],
      learningObjectives: [...(g.objectives ?? [])],
      curriculumRefs: [],
      tags: autoTags({
        subject: g.subject || project.subject,
        grade: g.grade || project.grade,
        assetType: "game",
        extra: [g.source.kind],
      }),
      language: "ro-RO",
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      author: "Profesor",
      createdBy: g.createdBy,
      version: g.version,
      usage: { openCount: 0, reuseCount: 0 },
      relations: [
        rel("belongs_to_project", project.id, project.title, 1),
        ...(g.lessonId
          ? [
              rel(
                "belongs_to_lesson",
                stableId("lesson", g.lessonId),
                lesson?.general.title ?? g.lessonId,
              ),
            ]
          : []),
      ],
      validationStatus: g.validation?.passed ? "validated" : "draft",
      ai: {
        summary: `Joc ${g.kind} din ${g.source.label}`,
        keywords,
        suggestedTags: keywords.slice(0, 8),
        embeddingsHint: keywords.join(" "),
      },
      shareScope: "personal",
      sharePermission: "read_only",
      estimatedMinutes: g.estimatedMinutes,
      difficulty: "medium",
      sourceBuilderId: g.id,
      sourceHref: `/game-builder/${project.id}/${g.id}`,
      contentPreview: g.rules?.slice(0, 400),
      archived: g.status === "archived",
      favorite: false,
      approvalState: "none",
    });
  }

  for (const p of presentationBuilderRepository.listByProject(project.id)) {
    const lesson = p.lessonId
      ? lessonBuilderRepository.getById(p.lessonId)
      : undefined;
    const keywords = tokenize(p.title, p.subject, ...p.objectives);
    out.push({
      id: stableId("presentation", p.id),
      name: p.title,
      description: p.teacherNotes || "Prezentare de clasă",
      assetType: "presentation",
      projectId: project.id,
      projectTitle: project.title,
      lessonId: p.lessonId,
      lessonTitle: lesson?.general.title,
      subject: p.subject || project.subject,
      grade: p.grade || project.grade,
      competencies: [...p.competencies],
      learningObjectives: [...p.objectives],
      curriculumRefs: [],
      tags: autoTags({
        subject: p.subject || project.subject,
        grade: p.grade || project.grade,
        assetType: "presentation",
        extra: [p.kind, p.source.kind],
      }),
      language: p.locale || "ro-RO",
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      author: "Profesor",
      createdBy: p.createdBy,
      version: p.version,
      usage: { openCount: 0, reuseCount: 0 },
      relations: [
        rel("belongs_to_project", project.id, project.title, 1),
        ...(p.lessonId
          ? [
              rel(
                "belongs_to_lesson",
                stableId("lesson", p.lessonId),
                lesson?.general.title ?? p.lessonId,
              ),
            ]
          : []),
      ],
      validationStatus: p.validation?.passed ? "validated" : "draft",
      ai: {
        summary: `Prezentare ${p.kind} · ${p.slides.length} slide-uri`,
        keywords,
        suggestedTags: keywords.slice(0, 8),
        embeddingsHint: keywords.join(" "),
      },
      shareScope: "personal",
      sharePermission: "read_only",
      estimatedMinutes: p.estimatedMinutes,
      sourceBuilderId: p.id,
      sourceHref: `/presentation-builder/${project.id}/${p.id}`,
      contentPreview: p.slides
        .slice(0, 5)
        .map((s) => s.title)
        .join(" · "),
      archived: p.status === "archived",
      favorite: false,
      approvalState: "none",
    });
  }

  // Workspace worksheets / generic resources
  for (const artifact of projectWorkspaceRepository.listArtifacts(project.id)) {
    if (artifact.status === "archived") continue;
    if (artifact.kind === "worksheet" || artifact.kind === "resource") {
      const assetType: ResourceAssetType =
        artifact.kind === "worksheet" ? "worksheet" : "ai_generated";
      const keywords = tokenize(artifact.title, ...artifact.tags);
      out.push({
        id: stableId(assetType, artifact.id),
        name: artifact.title,
        description: `Artifact workspace · ${artifact.kind}`,
        assetType,
        projectId: project.id,
        projectTitle: project.title,
        subject: project.subject,
        grade: project.grade,
        competencies: [],
        learningObjectives: [],
        curriculumRefs: [],
        tags: autoTags({
          subject: project.subject,
          grade: project.grade,
          assetType,
          extra: artifact.tags,
        }),
        language: "ro-RO",
        createdAt: artifact.createdAt,
        updatedAt: artifact.updatedAt,
        author: "Profesor",
        createdBy: artifact.createdBy,
        version: artifact.version,
        usage: { openCount: 0, reuseCount: 0 },
        relations: [rel("belongs_to_project", project.id, project.title, 1)],
        validationStatus:
          artifact.status === "ready" ? "validated" : "draft",
        ai: {
          summary: artifact.title,
          keywords,
          suggestedTags: keywords.slice(0, 6),
          embeddingsHint: keywords.join(" "),
        },
        shareScope: "personal",
        sharePermission: "collaborative",
        sourceBuilderId: artifact.id,
        sourceHref: `/studio/${project.id}/resources`,
        contentPreview: JSON.stringify(artifact.payload).slice(0, 300),
        archived: false,
        favorite: false,
        approvalState: "none",
      });
    }
  }

  return out;
}

/** Preserve usage stats when reindexing the same stable IDs. */
function mergeUsage(
  incoming: KnowledgeResource,
  previous?: KnowledgeResource,
): KnowledgeResource {
  if (!previous) return incoming;
  return {
    ...incoming,
    favorite: previous.favorite,
    shareScope: previous.shareScope,
    sharePermission: previous.sharePermission,
    approvalState: previous.approvalState,
    usage: previous.usage,
    // Keep teacher-enriched metadata if richer
    tags: Array.from(new Set([...incoming.tags, ...previous.tags])),
    description: previous.description?.length
      ? previous.description
      : incoming.description,
    ai: {
      ...incoming.ai,
      summary: previous.ai.summary || incoming.ai.summary,
      keywords: Array.from(
        new Set([...incoming.ai.keywords, ...previous.ai.keywords]),
      ),
      suggestedTags: Array.from(
        new Set([
          ...incoming.ai.suggestedTags,
          ...previous.ai.suggestedTags,
        ]),
      ),
      duplicateOfId: previous.ai.duplicateOfId,
      similarityClusterId: previous.ai.similarityClusterId,
    },
  };
}

export function reindexKnowledgeBase(
  projects: readonly Project[],
): KnowledgeResource[] {
  const previous = new Map(
    resourceCenterRepository.listAll().map((r) => [r.id, r]),
  );
  const indexed: KnowledgeResource[] = [];
  for (const project of projects.filter((p) => !p.archived)) {
    for (const resource of indexProject(project)) {
      indexed.push(mergeUsage(resource, previous.get(resource.id)));
    }
  }
  return resourceCenterRepository.replaceIndexed(indexed);
}

export function seedDemoMediaIfEmpty(project?: Project): KnowledgeResource[] {
  const existing = resourceCenterRepository.listActive();
  const hasManual = existing.some(
    (r) =>
      r.assetType === "image" ||
      r.assetType === "pdf" ||
      r.assetType === "template",
  );
  if (hasManual) return existing;
  const templates = [
    resourceCenterRepository.create({
      name: "Șablon fișă de lucru",
      description: "Template reutilizabil pentru fișe pe orice disciplină.",
      assetType: "template",
      projectId: project?.id,
      projectTitle: project?.title,
      subject: project?.subject ?? "General",
      grade: project?.grade ?? "Clasa a III-a",
      shareScope: "school",
      createdBy: "system",
    }),
    resourceCenterRepository.create({
      name: "Diagramă ciclul apei",
      description: "Imagine educațională pentru științe.",
      assetType: "image",
      projectId: project?.id,
      projectTitle: project?.title,
      subject: "Științe",
      grade: project?.grade ?? "Clasa a III-a",
      createdBy: "teacher",
    }),
    resourceCenterRepository.create({
      name: "Ghid curriculum PDF",
      description: "Document de referință curriculară.",
      assetType: "pdf",
      subject: "General",
      grade: "Toate",
      shareScope: "district",
      createdBy: "system",
    }),
  ];
  return [
    ...templates.map((t) =>
      resourceCenterRepository.save(
        {
          ...t,
          tags: [t.assetType, "seed", t.subject.toLowerCase()],
          competencies: ["Cunoaștere curriculară"],
          learningObjectives: ["Organizează resursele pentru oră"],
          curriculumRefs: ["Curriculum național"],
          ai: {
            keywords: tokenize(t.name, t.description),
            suggestedTags: [t.assetType, "bibliotecă"],
            summary: t.description,
            embeddingsHint: `${t.name} ${t.description}`,
          },
          estimatedMinutes: 10,
        },
        { actor: "system", note: "seed-enrich" },
      ),
    ),
  ];
}
