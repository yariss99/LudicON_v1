import { INTERVIEW_STORAGE_KEY, emptyAnswers } from "../constants";
import type { InterviewAnswers, InterviewDraft } from "../types";

function read(): InterviewDraft | null {
  try {
    const raw = localStorage.getItem(INTERVIEW_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as InterviewDraft;
    if (!parsed?.answers) return null;
    return {
      answers: { ...emptyAnswers(), ...parsed.answers },
      stepIndex: Math.max(0, parsed.stepIndex ?? 0),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function write(draft: InterviewDraft) {
  localStorage.setItem(INTERVIEW_STORAGE_KEY, JSON.stringify(draft));
}

export const interviewStore = {
  load(): InterviewDraft | null {
    return read();
  },

  save(answers: InterviewAnswers, stepIndex: number): InterviewDraft {
    const draft: InterviewDraft = {
      answers,
      stepIndex,
      updatedAt: new Date().toISOString(),
    };
    write(draft);
    return draft;
  },

  clear(): void {
    localStorage.removeItem(INTERVIEW_STORAGE_KEY);
  },
};
