import { lessonRepository } from "../repositories/lessonRepository";
import { projectService } from "./projectService";
import { generateMockLessonContent } from "./mockLessonGenerator";
import type {
  Lesson,
  LessonDraft,
  LessonGeneralInfo,
  LessonCurriculum,
  LessonTeachingDesign,
  LessonStyleId,
} from "../types/lesson";
import { createId } from "../utils/id";
import { nowIso } from "../utils/date";
import { teacherProfile } from "../data/workspaceData";

export function createEmptyLessonDraft(
  projectId: string,
  defaults?: Partial<LessonGeneralInfo>,
): LessonDraft {
  const project = projectService.getById(projectId);
  const today = new Date().toISOString().slice(0, 10);

  return {
    projectId,
    currentStep: 0,
    general: {
      title: defaults?.title ?? "",
      subject: defaults?.subject ?? project?.subject ?? "",
      grade: defaults?.grade ?? project?.grade ?? "",
      duration: defaults?.duration ?? 45,
      date: defaults?.date ?? today,
      author: defaults?.author ?? teacherProfile.fullName,
    },
    curriculum: {
      generalCompetencies: [],
      specificCompetencies: [],
      learningObjectives: [],
    },
    teaching: {
      teachingMethods: [],
      teachingResources: [],
      teachingMaterials: [],
      classroomOrganization: "",
    },
    style: null,
    updatedAt: nowIso(),
  };
}

/**
 * Lesson domain service.
 * Drafts autosave via repository; generated lessons persist per project.
 */
export class LessonService {
  private readonly repository = lessonRepository;

  listByProject(projectId: string): Lesson[] {
    return this.repository
      .loadAll()
      .filter((lesson) => lesson.projectId === projectId)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }

  getById(id: string): Lesson | undefined {
    return this.repository.loadAll().find((lesson) => lesson.id === id);
  }

  getDraft(projectId: string): LessonDraft | null {
    return this.repository.loadDraft(projectId);
  }

  getOrCreateDraft(projectId: string): LessonDraft {
    const existing = this.getDraft(projectId);
    if (existing) return existing;
    const draft = createEmptyLessonDraft(projectId);
    this.saveDraft(draft);
    return draft;
  }

  saveDraft(draft: LessonDraft): LessonDraft {
    const next: LessonDraft = {
      ...draft,
      updatedAt: nowIso(),
    };
    this.repository.saveDraft(next);
    return next;
  }

  updateGeneral(
    projectId: string,
    general: LessonGeneralInfo,
    currentStep = 0,
  ): LessonDraft {
    const draft = this.getOrCreateDraft(projectId);
    return this.saveDraft({ ...draft, general, currentStep });
  }

  updateCurriculum(
    projectId: string,
    curriculum: LessonCurriculum,
    currentStep = 1,
  ): LessonDraft {
    const draft = this.getOrCreateDraft(projectId);
    return this.saveDraft({ ...draft, curriculum, currentStep });
  }

  updateTeaching(
    projectId: string,
    teaching: LessonTeachingDesign,
    currentStep = 2,
  ): LessonDraft {
    const draft = this.getOrCreateDraft(projectId);
    return this.saveDraft({ ...draft, teaching, currentStep });
  }

  updateStyle(
    projectId: string,
    style: LessonStyleId,
    currentStep = 3,
  ): LessonDraft {
    const draft = this.getOrCreateDraft(projectId);
    return this.saveDraft({ ...draft, style, currentStep });
  }

  setStep(projectId: string, currentStep: number): LessonDraft {
    const draft = this.getOrCreateDraft(projectId);
    return this.saveDraft({ ...draft, currentStep });
  }

  clearDraft(projectId: string): void {
    this.repository.clearDraft(projectId);
  }

  generateFromDraft(projectId: string): Lesson {
    const draft = this.getDraft(projectId) ?? this.getOrCreateDraft(projectId);
    if (!draft.style) {
      throw new Error("STYLE_REQUIRED");
    }
    if (!draft.general.title.trim()) {
      throw new Error("TITLE_REQUIRED");
    }

    const content = generateMockLessonContent(draft);
    const timestamp = nowIso();

    const lesson: Lesson = {
      id: createId("les"),
      projectId,
      title: draft.general.title.trim(),
      subject: draft.general.subject.trim(),
      grade: draft.general.grade.trim(),
      duration: draft.general.duration,
      date: draft.general.date,
      author: draft.general.author.trim(),
      generalCompetencies: [...draft.curriculum.generalCompetencies],
      specificCompetencies: [...draft.curriculum.specificCompetencies],
      learningObjectives: [...draft.curriculum.learningObjectives],
      teachingMethods: [...draft.teaching.teachingMethods],
      teachingResources: [...draft.teaching.teachingResources],
      teachingMaterials: [...draft.teaching.teachingMaterials],
      classroomOrganization: draft.teaching.classroomOrganization,
      style: draft.style,
      content,
      status: "generated",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const all = this.repository.loadAll();
    this.repository.saveAll([lesson, ...all]);
    projectService.markResourceStatus(projectId, "lesson", "ready", lesson.title);
    this.repository.clearDraft(projectId);
    return lesson;
  }
}

export const lessonService = new LessonService();
