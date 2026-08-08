import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";
import { presentationStudioRepository } from "../../presentation-studio/services/presentationStudioRepository";
import { gameStudioRepository } from "../../game-studio/services/gameStudioRepository";
import type {
  ClassroomActivity,
  ClassroomCalendarEvent,
  ClassroomGroup,
  ClassroomResourcePick,
  ClassroomSession,
} from "../types";
import { GROUP_COLORS } from "../constants";

const KEY = "prima.classroom-studio.sessions.v1";

function read(): ClassroomSession[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ClassroomSession[];
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function write(items: ClassroomSession[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function normalize(session: ClassroomSession): ClassroomSession {
  return {
    ...session,
    className: session.className ?? "My class",
    teachingNotes: session.teachingNotes ?? "",
    activities: (session.activities ?? []).map((a, order) => ({
      ...a,
      teacherNotes: a.teacherNotes ?? "",
      estimatedMinutes: a.estimatedMinutes ?? 10,
      order,
    })),
    groups: session.groups ?? [],
    calendarEvents: session.calendarEvents ?? [],
    activeActivityId: session.activeActivityId ?? null,
  };
}

export function listClassroomResources(
  projectId: string,
): ClassroomResourcePick {
  return {
    lessons: lessonStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled lesson",
    })),
    presentations: presentationStudioRepository
      .listByProject(projectId)
      .map((d) => ({
        id: d.id,
        title: d.properties.title || "Untitled presentation",
      })),
    worksheets: worksheetStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled worksheet",
    })),
    games: gameStudioRepository.listByProject(projectId).map((d) => ({
      id: d.id,
      title: d.properties.title || "Untitled game",
    })),
    assessments: assessmentStudioRepository
      .listByProject(projectId)
      .map((d) => ({
        id: d.id,
        title: d.properties.title || "Untitled assessment",
      })),
  };
}

function buildDefaultActivities(
  projectId: string,
  picks: {
    lessonId?: string;
    presentationId?: string;
    worksheetId?: string;
    gameId?: string;
    assessmentId?: string;
  },
): ClassroomActivity[] {
  const activities: ClassroomActivity[] = [];
  let order = 0;

  if (picks.lessonId) {
    const lesson = lessonStudioRepository.getById(picks.lessonId);
    activities.push({
      id: createId("cact"),
      title: lesson?.properties.title || "Lesson",
      kind: "lesson",
      resourceId: picks.lessonId,
      resourceHref: `/lesson-studio/${projectId}/${picks.lessonId}`,
      estimatedMinutes: 15,
      teacherNotes: "Open with the learning goal and activate prior knowledge.",
      order: order++,
    });
  }
  if (picks.presentationId) {
    const doc = presentationStudioRepository.getById(picks.presentationId);
    activities.push({
      id: createId("cact"),
      title: doc?.properties.title || "Presentation",
      kind: "presentation",
      resourceId: picks.presentationId,
      resourceHref: `/presentation-studio/${projectId}/${picks.presentationId}`,
      estimatedMinutes: 12,
      teacherNotes: "Use Present mode; keep notes visible on the side.",
      order: order++,
    });
  }
  if (picks.worksheetId) {
    const doc = worksheetStudioRepository.getById(picks.worksheetId);
    activities.push({
      id: createId("cact"),
      title: doc?.properties.title || "Worksheet",
      kind: "worksheet",
      resourceId: picks.worksheetId,
      resourceHref: `/worksheet-studio/${projectId}/${picks.worksheetId}`,
      estimatedMinutes: 15,
      teacherNotes: "Circulate while students work; note stuck points.",
      order: order++,
    });
  }
  if (picks.gameId) {
    const doc = gameStudioRepository.getById(picks.gameId);
    activities.push({
      id: createId("cact"),
      title: doc?.properties.title || "Game",
      kind: "game",
      resourceId: picks.gameId,
      resourceHref: `/game-studio/${projectId}/${picks.gameId}`,
      estimatedMinutes: 12,
      teacherNotes: "Keep the learning objective visible during play.",
      order: order++,
    });
  }
  if (picks.assessmentId) {
    const doc = assessmentStudioRepository.getById(picks.assessmentId);
    activities.push({
      id: createId("cact"),
      title: doc?.properties.title || "Assessment",
      kind: "assessment",
      resourceId: picks.assessmentId,
      resourceHref: `/assessment-studio/${projectId}/${picks.assessmentId}`,
      estimatedMinutes: 15,
      teacherNotes: "Remind students this informs next teaching, not just scores.",
      order: order++,
    });
  }

  if (activities.length === 0) {
    activities.push({
      id: createId("cact"),
      title: "Welcome & goals",
      kind: "custom",
      estimatedMinutes: 5,
      teacherNotes: "Share today’s objective with the class.",
      order: 0,
    });
    activities.push({
      id: createId("cact"),
      title: "Core activity",
      kind: "custom",
      estimatedMinutes: 20,
      teacherNotes: "Link a lesson, presentation, worksheet, game, or assessment.",
      order: 1,
    });
    activities.push({
      id: createId("cact"),
      title: "Wrap-up",
      kind: "custom",
      estimatedMinutes: 5,
      teacherNotes: "Exit ticket or reflection.",
      order: 2,
    });
  }

  return activities;
}

function defaultGroups(): ClassroomGroup[] {
  return [
    {
      id: createId("cgrp"),
      name: "Group A",
      color: GROUP_COLORS[0],
      memberLabels: ["Student 1", "Student 2", "Student 3"],
      notes: "Can receive alternate activities in a later release.",
    },
    {
      id: createId("cgrp"),
      name: "Group B",
      color: GROUP_COLORS[1],
      memberLabels: ["Student 4", "Student 5", "Student 6"],
      notes: "",
    },
    {
      id: createId("cgrp"),
      name: "Group C",
      color: GROUP_COLORS[2],
      memberLabels: ["Student 7", "Student 8"],
      notes: "",
    },
  ];
}

class ClassroomStudioRepository {
  listByProject(projectId: string): ClassroomSession[] {
    return read()
      .filter((s) => s.projectId === projectId)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }

  getById(id: string): ClassroomSession | undefined {
    return read().find((s) => s.id === id);
  }

  /** Ensure a project has at least one classroom session. */
  ensureForProject(
    projectId: string,
    seed?: { className?: string; subject?: string },
  ): ClassroomSession {
    const existing = this.listByProject(projectId)[0];
    if (existing) return existing;
    return this.create(projectId, {
      title: "Today’s class",
      className: seed?.className || "My class",
    });
  }

  create(
    projectId: string,
    input: {
      title?: string;
      className?: string;
      lessonId?: string;
      presentationId?: string;
      worksheetId?: string;
      gameId?: string;
      assessmentId?: string;
    },
  ): ClassroomSession {
    const timestamp = nowIso();
    const lesson = input.lessonId
      ? lessonStudioRepository.getById(input.lessonId)
      : undefined;
    const activities = buildDefaultActivities(projectId, input);
    const today = timestamp.slice(0, 10);
    const calendarEvents: ClassroomCalendarEvent[] = [
      {
        id: createId("ccal"),
        title: input.title?.trim() || "Class session",
        date: today,
        activityId: activities[0]?.id,
        notes: "",
      },
    ];

    const session: ClassroomSession = {
      id: createId("cls"),
      projectId,
      title: input.title?.trim() || "Today’s class",
      className: input.className?.trim() || "My class",
      lessonId: input.lessonId,
      lessonTitle: lesson?.properties.title,
      presentationId: input.presentationId,
      worksheetId: input.worksheetId,
      gameId: input.gameId,
      assessmentId: input.assessmentId,
      activities,
      groups: defaultGroups(),
      calendarEvents,
      activeActivityId: activities[0]?.id ?? null,
      teachingNotes: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    write([session, ...read()]);
    return session;
  }

  save(session: ClassroomSession): ClassroomSession {
    const next = {
      ...normalize(session),
      updatedAt: nowIso(),
    };
    const all = read();
    const index = all.findIndex((s) => s.id === next.id);
    if (index === -1) write([next, ...all]);
    else {
      const copy = [...all];
      copy[index] = next;
      write(copy);
    }
    return next;
  }

  /** Rebuild timeline from linked lesson + companion resources. */
  applyResourceBundle(
    sessionId: string,
    picks: {
      lessonId?: string;
      presentationId?: string;
      worksheetId?: string;
      gameId?: string;
      assessmentId?: string;
    },
  ): ClassroomSession {
    const session = this.getById(sessionId);
    if (!session) throw new Error("NOT_FOUND");
    const lesson = picks.lessonId
      ? lessonStudioRepository.getById(picks.lessonId)
      : undefined;
    const activities = buildDefaultActivities(session.projectId, picks);
    return this.save({
      ...session,
      lessonId: picks.lessonId,
      lessonTitle: lesson?.properties.title,
      presentationId: picks.presentationId,
      worksheetId: picks.worksheetId,
      gameId: picks.gameId,
      assessmentId: picks.assessmentId,
      activities,
      activeActivityId: activities[0]?.id ?? null,
    });
  }

  delete(id: string): void {
    write(read().filter((s) => s.id !== id));
  }
}

export const classroomStudioRepository = new ClassroomStudioRepository();
