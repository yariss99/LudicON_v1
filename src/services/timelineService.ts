import { timelineRepository } from "../repositories/timelineRepository";
import type {
  MoveSuggestion,
  SchoolYearTimeline,
  TimelineLesson,
  TimelineRelatedResource,
  TimelineStatus,
  TimelineWeek,
} from "../types/timeline";

function currentWeekId(timeline: SchoolYearTimeline): string {
  const today = new Date();
  const hit = timeline.weeks.find((week) => {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  });
  return hit?.id ?? "w4";
}

export class TimelineService {
  private readonly repository = timelineRepository;

  getTimeline(): SchoolYearTimeline {
    return this.repository.load();
  }

  getCurrentWeekId(): string {
    return currentWeekId(this.getTimeline());
  }

  getWeek(weekId: string): TimelineWeek | undefined {
    return this.getTimeline().weeks.find((week) => week.id === weekId);
  }

  getLessonsForWeek(weekId: string): TimelineLesson[] {
    return this.getTimeline().lessons.filter((lesson) => lesson.weekId === weekId);
  }

  getRelatedResources(lesson: TimelineLesson): TimelineRelatedResource[] {
    const timeline = this.getTimeline();
    return timeline.resources.filter((resource) =>
      lesson.relatedResourceIds.includes(resource.id),
    );
  }

  prepareMove(lessonId: string, toWeekId: string): MoveSuggestion | null {
    const timeline = this.getTimeline();
    const lesson = timeline.lessons.find((item) => item.id === lessonId);
    if (!lesson || lesson.weekId === toWeekId) return null;

    return {
      lessonId,
      fromWeekId: lesson.weekId,
      toWeekId,
      related: this.getRelatedResources(lesson),
    };
  }

  /**
   * Move a lesson. Related resources are only "moved" conceptually with the lesson
   * (they stay attached). Never auto-moves sibling lessons — teacher already decided.
   */
  confirmMove(lessonId: string, toWeekId: string): SchoolYearTimeline {
    const timeline = this.getTimeline();
    const lessons = timeline.lessons.map((lesson) =>
      lesson.id === lessonId ? { ...lesson, weekId: toWeekId } : lesson,
    );
    const next = { ...timeline, lessons };
    this.repository.save(next);
    return next;
  }

  updateLessonStatus(
    lessonId: string,
    status: TimelineStatus,
  ): SchoolYearTimeline {
    const timeline = this.getTimeline();
    const lessons = timeline.lessons.map((lesson) =>
      lesson.id === lessonId ? { ...lesson, status } : lesson,
    );
    const next = { ...timeline, lessons };
    this.repository.save(next);
    return next;
  }

  getMemoryForWeek(weekNumber: number) {
    return this.getTimeline().memory.filter(
      (entry) => entry.weekNumber === weekNumber,
    );
  }
}

export const timelineService = new TimelineService();
