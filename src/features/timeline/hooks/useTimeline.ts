import { useCallback, useMemo, useState } from "react";
import { timelineService } from "../../../services/timelineService";
import type {
  MoveSuggestion,
  SchoolYearTimeline,
  TimelineStatus,
} from "../../../types/timeline";

export function useTimeline() {
  const [timeline, setTimeline] = useState<SchoolYearTimeline>(() =>
    timelineService.getTimeline(),
  );
  const [activeWeekId, setActiveWeekId] = useState(
    () => timelineService.getCurrentWeekId(),
  );
  const [pendingMove, setPendingMove] = useState<MoveSuggestion | null>(null);
  const [memoryWeekNumber, setMemoryWeekNumber] = useState<number | null>(null);

  const currentWeekId = useMemo(() => timelineService.getCurrentWeekId(), []);

  const jumpToWeek = useCallback((weekId: string) => {
    setActiveWeekId(weekId);
    const el = document.getElementById(`timeline-week-${weekId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const requestMove = useCallback((lessonId: string, toWeekId: string) => {
    const suggestion = timelineService.prepareMove(lessonId, toWeekId);
    if (!suggestion) return;
    if (suggestion.related.length === 0) {
      setTimeline(timelineService.confirmMove(lessonId, toWeekId));
      setActiveWeekId(toWeekId);
      return;
    }
    setPendingMove(suggestion);
  }, []);

  const confirmPendingMove = useCallback(() => {
    if (!pendingMove) return;
    setTimeline(
      timelineService.confirmMove(pendingMove.lessonId, pendingMove.toWeekId),
    );
    setActiveWeekId(pendingMove.toWeekId);
    setPendingMove(null);
  }, [pendingMove]);

  const cancelPendingMove = useCallback(() => {
    setPendingMove(null);
  }, []);

  const setStatus = useCallback((lessonId: string, status: TimelineStatus) => {
    setTimeline(timelineService.updateLessonStatus(lessonId, status));
  }, []);

  const openMemory = useCallback((weekNumber: number) => {
    setMemoryWeekNumber(weekNumber);
  }, []);

  const closeMemory = useCallback(() => {
    setMemoryWeekNumber(null);
  }, []);

  const memoryEntries =
    memoryWeekNumber == null
      ? []
      : timeline.memory.filter((entry) => entry.weekNumber === memoryWeekNumber);

  return {
    timeline,
    activeWeekId,
    currentWeekId,
    pendingMove,
    memoryWeekNumber,
    memoryEntries,
    jumpToWeek,
    requestMove,
    confirmPendingMove,
    cancelPendingMove,
    setStatus,
    openMemory,
    closeMemory,
  };
}
