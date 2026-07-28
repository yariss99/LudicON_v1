import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createEmptyLessonDraft,
  lessonService,
} from "../../../services/lessonService";
import type {
  Lesson,
  LessonCurriculum,
  LessonDraft,
  LessonFormErrors,
  LessonGeneralInfo,
  LessonStyleId,
  LessonTeachingDesign,
} from "../../../types/lesson";
import { LESSON_WIZARD_STEPS } from "../constants";

function validateGeneral(general: LessonGeneralInfo): LessonFormErrors {
  const errors: LessonFormErrors = {};
  if (!general.title.trim()) errors.title = "Titlul lecției este obligatoriu.";
  if (!general.subject.trim()) errors.subject = "Selectează disciplina.";
  if (!general.grade.trim()) errors.grade = "Selectează clasa.";
  if (!general.duration || general.duration < 1) {
    errors.duration = "Selectează durata.";
  }
  if (!general.date.trim()) errors.date = "Selectează data.";
  if (!general.author.trim()) errors.author = "Autorul este obligatoriu.";
  return errors;
}

function validateCurriculum(curriculum: LessonCurriculum): LessonFormErrors {
  const errors: LessonFormErrors = {};
  if (curriculum.generalCompetencies.length === 0) {
    errors.generalCompetencies = "Selectează cel puțin o competență generală.";
  }
  if (curriculum.specificCompetencies.length === 0) {
    errors.specificCompetencies = "Selectează cel puțin o competență specifică.";
  }
  if (curriculum.learningObjectives.length === 0) {
    errors.learningObjectives = "Selectează cel puțin un obiectiv.";
  }
  return errors;
}

function validateTeaching(teaching: LessonTeachingDesign): LessonFormErrors {
  const errors: LessonFormErrors = {};
  if (teaching.teachingMethods.length === 0) {
    errors.teachingMethods = "Selectează cel puțin o metodă.";
  }
  if (teaching.teachingResources.length === 0) {
    errors.teachingResources = "Selectează cel puțin o resursă.";
  }
  if (teaching.teachingMaterials.length === 0) {
    errors.teachingMaterials = "Selectează cel puțin un material.";
  }
  if (!teaching.classroomOrganization.trim()) {
    errors.classroomOrganization = "Selectează organizarea clasei.";
  }
  return errors;
}

function validateStyle(style: LessonStyleId | null): LessonFormErrors {
  return style ? {} : { style: "Alege un stil pentru lecție." };
}

export function useLessonWizard(projectId: string) {
  const [draft, setDraft] = useState<LessonDraft>(() =>
    lessonService.getOrCreateDraft(projectId),
  );
  const [errors, setErrors] = useState<LessonFormErrors>({});
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDraft(lessonService.getOrCreateDraft(projectId));
    setGeneratedLesson(null);
    setErrors({});
  }, [projectId]);

  const flushSave = useCallback((next: LessonDraft) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    lessonService.saveDraft(next);
  }, []);

  const persist = useCallback(
    (next: LessonDraft, immediate = false) => {
      setDraft(next);
      if (immediate) {
        flushSave(next);
        return;
      }
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        lessonService.saveDraft(next);
      }, 250);
    },
    [flushSave],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const currentStep = draft.currentStep;

  const setGeneral = useCallback(
    (general: LessonGeneralInfo) => {
      persist({ ...draft, general, updatedAt: new Date().toISOString() });
    },
    [draft, persist],
  );

  const setCurriculum = useCallback(
    (curriculum: LessonCurriculum) => {
      persist({ ...draft, curriculum, updatedAt: new Date().toISOString() });
    },
    [draft, persist],
  );

  const setTeaching = useCallback(
    (teaching: LessonTeachingDesign) => {
      persist({ ...draft, teaching, updatedAt: new Date().toISOString() });
    },
    [draft, persist],
  );

  const setStyle = useCallback(
    (style: LessonStyleId) => {
      persist({ ...draft, style, updatedAt: new Date().toISOString() });
    },
    [draft, persist],
  );

  const goToStep = useCallback(
    (step: number) => {
      const bounded = Math.max(0, Math.min(step, LESSON_WIZARD_STEPS.length - 1));
      persist({ ...draft, currentStep: bounded }, true);
    },
    [draft, persist],
  );

  const validateCurrentStep = useCallback((): boolean => {
    let nextErrors: LessonFormErrors = {};
    if (currentStep === 0) nextErrors = validateGeneral(draft.general);
    if (currentStep === 1) nextErrors = validateCurriculum(draft.curriculum);
    if (currentStep === 2) nextErrors = validateTeaching(draft.teaching);
    if (currentStep === 3) nextErrors = validateStyle(draft.style);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [currentStep, draft]);

  const next = useCallback(() => {
    if (!validateCurrentStep()) return false;
    goToStep(currentStep + 1);
    setErrors({});
    return true;
  }, [validateCurrentStep, goToStep, currentStep]);

  const back = useCallback(() => {
    goToStep(currentStep - 1);
    setErrors({});
  }, [goToStep, currentStep]);

  const generate = useCallback(async () => {
    if (!validateCurrentStep() && currentStep !== 4) return null;
    const reviewErrors = {
      ...validateGeneral(draft.general),
      ...validateCurriculum(draft.curriculum),
      ...validateTeaching(draft.teaching),
      ...validateStyle(draft.style),
    };
    setErrors(reviewErrors);
    if (Object.keys(reviewErrors).length > 0) {
      if (reviewErrors.title || reviewErrors.subject || reviewErrors.grade) {
        goToStep(0);
      } else if (
        reviewErrors.generalCompetencies ||
        reviewErrors.specificCompetencies ||
        reviewErrors.learningObjectives
      ) {
        goToStep(1);
      } else if (
        reviewErrors.teachingMethods ||
        reviewErrors.teachingResources ||
        reviewErrors.teachingMaterials ||
        reviewErrors.classroomOrganization
      ) {
        goToStep(2);
      } else if (reviewErrors.style) {
        goToStep(3);
      }
      return null;
    }

    setIsGenerating(true);
    try {
      lessonService.saveDraft(draft);
      await new Promise((resolve) => setTimeout(resolve, 450));
      const lesson = lessonService.generateFromDraft(projectId);
      setGeneratedLesson(lesson);
      return lesson;
    } finally {
      setIsGenerating(false);
    }
  }, [validateCurrentStep, currentStep, draft, goToStep, projectId]);

  const resetWizard = useCallback(() => {
    lessonService.clearDraft(projectId);
    const nextDraft = createEmptyLessonDraft(projectId);
    lessonService.saveDraft(nextDraft);
    setDraft(nextDraft);
    setGeneratedLesson(null);
    setErrors({});
  }, [projectId]);

  const stepMeta = useMemo(
    () => LESSON_WIZARD_STEPS[currentStep] ?? LESSON_WIZARD_STEPS[0],
    [currentStep],
  );

  return {
    draft,
    errors,
    currentStep,
    stepMeta,
    generatedLesson,
    isGenerating,
    setGeneral,
    setCurriculum,
    setTeaching,
    setStyle,
    goToStep,
    next,
    back,
    generate,
    resetWizard,
  };
}
