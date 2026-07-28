import type { Project } from "../../../types/project";
import { buildProjectCoreContext } from "../../project-workspace/services/projectCoreBridge";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { assessmentBuilderRepository } from "../../assessment-builder/services/assessmentBuilderRepository";
import { storyBuilderRepository } from "../../story-builder/services/storyBuilderRepository";
import type {
  PresentationAiActionId,
  PresentationDocument,
  PresentationSectionId,
  PresentationSlide,
  PresentationSourceKind,
  SlideType,
} from "../types";
import { createBlankSlide } from "./presentationBuilderRepository";

export type PresentationCorePromptPackage = {
  readonly system: string;
  readonly user: string;
  readonly action: PresentationAiActionId;
  readonly projectId: string;
  readonly presentationId: string;
  readonly engines: readonly string[];
};

export function buildPresentationPromptPackage(input: {
  project: Project;
  presentation: PresentationDocument;
  action: PresentationAiActionId;
  sectionId?: PresentationSectionId;
}): PresentationCorePromptPackage {
  const lesson = input.presentation.lessonId
    ? lessonBuilderRepository.getById(input.presentation.lessonId)
    : undefined;
  const meta = projectWorkspaceRepository.getMetadata(input.project.id);
  const core = buildProjectCoreContext({
    project: input.project,
    activeTab: "presentations",
    activeArtifactId: input.presentation.workspaceArtifactId,
    intent: `Presentation Builder · ${input.action} · ${input.presentation.title}`,
  });

  return {
    system:
      "PRIMA Presentation Builder — classroom presentations from existing PRIMA content. Teacher remains in control.",
    user: [
      `Project: ${core.projectTitle}`,
      `Subject: ${core.subject}`,
      `Grade: ${core.grade}`,
      meta.curriculumRef ? `Curriculum: ${meta.curriculumRef}` : null,
      `Lesson: ${lesson?.general.title ?? input.presentation.lessonId ?? "n/a"}`,
      `Presentation: ${input.presentation.title} (${input.presentation.kind})`,
      `Source: ${input.presentation.source.kind} · ${input.presentation.source.label}`,
      `Theme: ${input.presentation.themeId}`,
      `Action: ${input.action}`,
      input.sectionId ? `Section: ${input.sectionId}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    action: input.action,
    projectId: input.project.id,
    presentationId: input.presentation.id,
    engines: [
      "WorkflowEngine",
      "ContextEngine",
      "PromptBuilder",
      "AiOrchestrator",
      "ValidationEngine",
      "MemoryEngine",
      "ToolEngine",
      "Runtime",
    ],
  };
}

function slide(
  type: SlideType,
  order: number,
  title: string,
  body: string,
  bullets: string[] = [],
  notes = "",
): PresentationSlide {
  return {
    ...createBlankSlide(type, order),
    title,
    body,
    bullets,
    speakerNotes: notes,
    estimatedSeconds: type === "title" ? 20 : type === "activity" ? 90 : 45,
  };
}

function buildDeck(input: {
  title: string;
  subject: string;
  grade: string;
  objectives: string[];
  competencies: string[];
  explanationPoints: string[];
  activity?: string;
  assessmentPrompt?: string;
  homework?: string;
}): PresentationSlide[] {
  const objs =
    input.objectives.length > 0
      ? input.objectives
      : [`Înțelege ideea principală din „${input.title}"`];
  return [
    slide(
      "title",
      0,
      input.title,
      `${input.subject} · ${input.grade}`,
      [],
      "Salută clasa și anunță tema orei.",
    ),
    slide(
      "objectives",
      1,
      "Obiective",
      "La finalul orei, elevii vor putea:",
      objs.slice(0, 4),
      "Citește obiectivele pe rând, limpede.",
    ),
    slide(
      "introduction",
      2,
      "Introducere",
      "Activăm cunoștințele anterioare și contextul.",
      ["Ce știm deja?", "De ce contează azi?"],
      "Pune 1–2 întrebări scurte clasei.",
    ),
    slide(
      "explanation",
      3,
      "Explicație",
      "Conceptul-cheie, pas cu pas.",
      input.explanationPoints.slice(0, 4),
      "Modelează un exemplu pe tablă.",
    ),
    slide(
      "diagram",
      4,
      "Diagramă / schemă",
      "Reprezentare vizuală a ideii principale.",
      ["Element 1", "Element 2", "Relație"],
      "Arată schema și cere elevilor să o reformuleze.",
    ),
    slide(
      "activity",
      5,
      "Activitate",
      input.activity ?? "Lucru scurt în perechi pe ideea lecției.",
      ["1 minut gândire", "1 minut schimb", "feedback rapid"],
      "Cronometrează activitatea.",
    ),
    slide(
      "question",
      6,
      "Întrebare de verificare",
      input.assessmentPrompt ?? "Ce idee păstrăm din această explicație?",
      [],
      "Ascultă 2–3 răspunsuri, clarifică.",
    ),
    slide(
      "discussion",
      7,
      "Discuție",
      "Unde mai întâlnim ideea în viața reală?",
      [],
      "Facilitează, nu monopoliza.",
    ),
    slide(
      "reflection",
      8,
      "Reflecție",
      "Ce a fost clar? Ce mai exersăm?",
      [],
      "Lasă 30 de secunde de scriere rapidă.",
    ),
    slide(
      "summary",
      9,
      "Rezumat",
      "Ideile esențiale ale orei.",
      objs.slice(0, 3),
      "Reamintește obiectivele atinse.",
    ),
    slide(
      "homework",
      10,
      "Temă",
      input.homework ?? "O sarcină scurtă de consolidare (max. 10 minute).",
      [],
      "Anunță termenul și criteriul de reușită.",
    ),
  ];
}

function resolveSource(
  project: Project,
  presentation: PresentationDocument,
  preferred: PresentationSourceKind,
): {
  kind: PresentationSourceKind;
  label: string;
  resourceId?: string;
  lessonId?: string;
  objectives: string[];
  competencies: string[];
  explanationPoints: string[];
  activity?: string;
  assessmentPrompt?: string;
  homework?: string;
  themeHint?: PresentationDocument["themeId"];
} {
  const lesson =
    (presentation.lessonId
      ? lessonBuilderRepository.getById(presentation.lessonId)
      : undefined) ?? lessonBuilderRepository.listByProject(project.id)[0];

  if (preferred === "assessment") {
    const assessment = assessmentBuilderRepository.listByProject(project.id)[0];
    if (assessment) {
      return {
        kind: "assessment",
        label: assessment.title,
        resourceId: assessment.id,
        lessonId: assessment.lessonId,
        objectives: [...assessment.objectives],
        competencies: [...assessment.competencies],
        explanationPoints: assessment.criteria.slice(0, 4),
        assessmentPrompt:
          assessment.groups[0]?.questions[0]?.prompt ??
          "Item de verificare din evaluare",
        homework: "Revizuiește baremul și un item greșit.",
      };
    }
  }

  if (preferred === "story") {
    const story = storyBuilderRepository.listByProject(project.id)[0];
    if (story) {
      return {
        kind: "story",
        label: story.title,
        resourceId: story.id,
        lessonId: story.lessonId,
        objectives: [...story.objectives],
        competencies: [...story.competencies],
        explanationPoints: story.scenes
          .slice(0, 4)
          .map((s) => s.title || s.narration.slice(0, 80)),
        activity: story.activities[0] ?? "Continuă o scenă din poveste.",
        assessmentPrompt: story.assessmentMoments[0],
        homework: "Desenează / scrie un final alternativ.",
        themeHint: "storybook",
      };
    }
  }

  if (preferred === "worksheet") {
    const ws = projectWorkspaceRepository
      .listArtifacts(project.id)
      .find((a) => a.kind === "worksheet" && a.status !== "archived");
    if (ws) {
      return {
        kind: "worksheet",
        label: ws.title,
        resourceId: ws.id,
        lessonId: lesson?.id,
        objectives: lesson?.objectives ? [...lesson.objectives] : [],
        competencies: lesson?.competencies ? [...lesson.competencies] : [],
        explanationPoints: [
          `Itemi din fișa „${ws.title}"`,
          "Pași de rezolvare",
          "Verificare rapidă",
        ],
        activity: "Rezolvă 2 itemi de pe fișă pe rânduri.",
        homework: `Finalizează fișa „${ws.title}".`,
      };
    }
  }

  if (preferred === "project") {
    return {
      kind: "project",
      label: project.title,
      resourceId: project.id,
      lessonId: lesson?.id,
      objectives: lesson?.objectives
        ? [...lesson.objectives]
        : [`Prezintă proiectul „${project.title}"`],
      competencies: lesson?.competencies ? [...lesson.competencies] : [],
      explanationPoints: [
        project.description || "Contextul proiectului",
        project.subject,
        project.grade,
      ],
      activity: "Elevii prezintă un artefact din proiect.",
      themeHint: "atelier_calm",
    };
  }

  // lesson / template fallback
  return {
    kind: preferred === "template" ? "template" : "lesson",
    label: lesson?.general.title ?? "Lecția curentă",
    resourceId: lesson?.id,
    lessonId: lesson?.id,
    objectives: lesson?.objectives
      ? [...lesson.objectives]
      : presentation.objectives.length
        ? [...presentation.objectives]
        : [`Explorează „${presentation.title}"`],
    competencies: lesson?.competencies
      ? [...lesson.competencies]
      : [...presentation.competencies],
    explanationPoints: lesson?.phases
      ?.filter((p) => p.content.trim())
      .slice(0, 4)
      .map((p) => p.title) ?? [
      "Idee principală",
      "Exemplu",
      "Aplicare",
      "Verificare",
    ],
    activity: "Activitate ghidată pe conceptul orei.",
    assessmentPrompt: "Exit ticket: o idee + o confuzie.",
    homework: "Temă scurtă de consolidare.",
    themeHint: preferred === "lesson" ? "atelier_calm" : undefined,
  };
}

export function applyPresentationAiAction(input: {
  project: Project;
  presentation: PresentationDocument;
  action: PresentationAiActionId;
  sectionId?: PresentationSectionId;
}): { presentation: PresentationDocument; prompt: PresentationCorePromptPackage } {
  const prompt = buildPresentationPromptPackage(input);
  const doc = input.presentation;
  let next: PresentationDocument = { ...doc };

  const sourcePreferred: PresentationSourceKind =
    doc.source.kind === "template" ? "lesson" : doc.source.kind;

  if (input.action === "generate_entire" || input.action === "summarize_lesson") {
    const sourced = resolveSource(input.project, doc, sourcePreferred);
    const slides = buildDeck({
      title: doc.title,
      subject: doc.subject || input.project.subject,
      grade: doc.grade || input.project.grade,
      objectives: sourced.objectives,
      competencies: sourced.competencies,
      explanationPoints: sourced.explanationPoints,
      activity: sourced.activity,
      assessmentPrompt: sourced.assessmentPrompt,
      homework: sourced.homework,
    });
    next = {
      ...doc,
      lessonId: sourced.lessonId ?? doc.lessonId,
      source: {
        kind: sourced.kind,
        label: sourced.label,
        resourceId: sourced.resourceId,
      },
      objectives: sourced.objectives,
      competencies: sourced.competencies,
      slides,
      themeId: sourced.themeHint ?? doc.themeId,
      teacherNotes: `Generat din „${sourced.label}".`,
    };
  } else if (input.action === "generate_slides") {
    next = {
      ...doc,
      slides: [
        ...doc.slides,
        slide(
          "explanation",
          doc.slides.length,
          "Slide generat",
          "Conținut scurt, clar, gata de clasă.",
          ["Punct 1", "Punct 2"],
          "Vorbește pe bullet-uri, nu citi tot.",
        ),
      ],
    };
  } else if (input.action === "improve_slides") {
    next = {
      ...doc,
      slides: doc.slides.map((s) => ({
        ...s,
        body:
          s.body.length > 360
            ? `${s.body.slice(0, 320)}…`
            : s.body || "Mesaj clar, o idee pe slide.",
        bullets: s.bullets.slice(0, 5),
      })),
      teacherNotes: `${doc.teacherNotes}\n\n[PRIMA] Slide-uri scurtate pentru lizibilitate.`.trim(),
    };
  } else if (input.action === "generate_speaker_notes") {
    next = {
      ...doc,
      slides: doc.slides.map((s) => ({
        ...s,
        speakerNotes:
          s.speakerNotes ||
          `Spune pe scurt: ${s.title}. Pauză. Verifică înțelegerea.`,
      })),
    };
  } else if (input.action === "generate_diagrams") {
    next = {
      ...doc,
      slides: [
        ...doc.slides,
        {
          ...slide(
            "diagram",
            doc.slides.length,
            "Schemă generată",
            "Diagramă conceptuală pentru ideea orei.",
            ["Nod A", "Nod B", "Legătură"],
            "Desenează schema live sau arată imaginea.",
          ),
          media: [
            {
              kind: "chart",
              label: "Diagramă conceptuală",
              promptOrUrl: `Schemă clară pentru ${doc.title}, stil educațional`,
            },
          ],
        },
      ],
    };
  } else if (input.action === "generate_visual_suggestions") {
    next = {
      ...doc,
      slides: doc.slides.map((s) =>
        s.media.length > 0
          ? s
          : {
              ...s,
              media: [
                {
                  kind: "image",
                  label: `Visual pentru ${s.title}`,
                  promptOrUrl: `Imagine didactică calmă, ${doc.subject}, fără text pe imagine`,
                },
              ],
            },
      ),
    };
  } else if (input.action === "generate_animation_suggestions") {
    next = {
      ...doc,
      slides: doc.slides.map((s) => ({
        ...s,
        animationSuggestion:
          s.animationSuggestion ||
          (s.type === "title"
            ? "Fade-in titlu"
            : s.bullets.length > 0
              ? "Appear pe bullet-uri"
              : "Fade ușor pe conținut"),
      })),
    };
  } else if (input.action === "adapt_presentation") {
    next = {
      ...doc,
      kind: doc.kind === "teacher" ? "student" : doc.kind,
      teacherNotes: `${doc.teacherNotes}\n\n[PRIMA] Adaptat pentru ${doc.grade}: text mai scurt, activitate mai clară.`.trim(),
      slides: doc.slides.map((s) => ({
        ...s,
        estimatedSeconds: Math.max(20, Math.round(s.estimatedSeconds * 0.9)),
      })),
    };
  } else if (input.action === "translate_presentation") {
    next = {
      ...doc,
      locale: doc.locale === "ro-RO" ? "en-RO" : "ro-RO",
      slides: doc.slides.map((s) => ({
        ...s,
        speakerNotes: `${s.speakerNotes}\n\n[EN sketch] Key idea: ${s.title}`.trim(),
      })),
      teacherNotes: `${doc.teacherNotes}\n\n[PRIMA] Note bilingve adăugate.`.trim(),
    };
  }

  return { presentation: next, prompt };
}

export function syncPresentationToWorkspace(
  presentation: PresentationDocument,
): string {
  const existingId = presentation.workspaceArtifactId;
  if (existingId) {
    const existing = projectWorkspaceRepository.getArtifact(existingId);
    if (existing && existing.projectId === presentation.projectId) {
      projectWorkspaceRepository.updateArtifact(existingId, {
        title: presentation.title,
        status:
          presentation.status === "published"
            ? "ready"
            : presentation.status === "archived"
              ? "archived"
              : "draft",
        payload: {
          presentationId: presentation.id,
          lessonId: presentation.lessonId,
          version: presentation.version,
          kind: presentation.kind,
          source: presentation.source,
          themeId: presentation.themeId,
        },
        note: `presentation-sync v${presentation.version}`,
        actor: "system",
      });
      return existingId;
    }
  }

  const unit = projectWorkspaceRepository.ensureDefaultUnit(
    presentation.projectId,
  );
  const artifact = projectWorkspaceRepository.createArtifact({
    projectId: presentation.projectId,
    kind: "presentation",
    title: presentation.title,
    unitId: unit.id,
    createdBy: presentation.createdBy,
    payload: {
      presentationId: presentation.id,
      lessonId: presentation.lessonId,
      version: presentation.version,
      kind: presentation.kind,
      source: presentation.source,
      themeId: presentation.themeId,
    },
    tags: ["presentation-builder", presentation.kind, presentation.source.kind],
  });
  return artifact.id;
}

export function ensureLessonForProject(project: Project): string {
  const existing = lessonBuilderRepository.listByProject(project.id)[0];
  if (existing) return existing.id;
  const created = lessonBuilderRepository.create({
    projectId: project.id,
    general: {
      title: `Lecție pentru prezentări · ${project.title}`,
      subject: project.subject,
      grade: project.grade,
    },
  });
  return created.id;
}

export function seedPresentationFromBestSource(
  project: Project,
  presentation: PresentationDocument,
): PresentationDocument {
  const { presentation: generated } = applyPresentationAiAction({
    project,
    presentation,
    action: "generate_entire",
  });
  return generated;
}
