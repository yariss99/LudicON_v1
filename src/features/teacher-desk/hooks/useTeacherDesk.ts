import { useDeskBusinessState } from "./useDeskBusinessState";
import { useDeskNetworkState } from "./useDeskNetworkState";
import { useDeskUiState } from "./useDeskUiState";

export function useTeacherDesk() {
  const business = useDeskBusinessState();
  const { networkState, retry } = useDeskNetworkState(business.refresh);
  const ui = useDeskUiState();

  return {
    networkState,
    retry,
    isEmpty: business.isEmpty,
    dailyBrief: business.dailyBrief,
    todayFocus: business.todayFocus,
    todaysTeaching: business.todaysTeaching,
    recentProjects: business.recentProjects,
    atelierImpact: business.atelierImpact,
    focusExperienceId: business.focusExperienceId,
    createExperience: business.createExperience,
    browseLibrary: business.browseLibrary,
    continueExperience: business.continueExperience,
    mobileNavOpen: ui.mobileNavOpen,
    setMobileNavOpen: ui.setMobileNavOpen,
  };
}
