export { greetingForHour } from "./greeting";
export { formatDeskDay } from "./formatDeskDay";
export { buildDailyBrief } from "./dailyBriefService";
export { buildTodayFocusView } from "./focusService";
export { buildTodaysTeachingView } from "./todaysTeachingService";
export {
  pickTeachingInsight,
  resolveInitialTeachingInsight,
} from "./insightService";
export {
  dismissInsightForToday,
  isInsightDismissedForToday,
} from "./insightDismissStore";
export {
  DESK_NAV,
  QUICK_ACCESS_ITEMS,
  TEACHING_INSIGHTS,
  TEACHING_TIMELINE,
} from "./mockData";
export {
  buildAtelierImpact,
  countReadyMaterials,
  estimateHoursPrepared,
  formatRelativeEdited,
  progressPercentFromState,
} from "./atelierMetrics";
