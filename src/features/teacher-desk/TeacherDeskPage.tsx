import AtelierHero from "./components/AtelierHero";
import DeskErrorState from "./components/DeskErrorState";
import DeskLayout from "./components/DeskLayout";
import SkeletonWorkspace from "./components/SkeletonWorkspace";
import { useTeacherDesk } from "./hooks";
import {
  ActivityImpactSection,
  ContinueWorkingSection,
  CreateActionsSection,
  PrimaRecommendationsSection,
} from "./sections";

/**
 * Atelierul Profesorului — Teacher Studio home (PRIMA v2).
 */
function TeacherDeskPage() {
  const desk = useTeacherDesk();

  return (
    <DeskLayout
      mobileNavOpen={desk.mobileNavOpen}
      onMobileNavToggle={() => desk.setMobileNavOpen((open) => !open)}
      main={
        <>
          {desk.networkState === "loading" ? <SkeletonWorkspace /> : null}

          {desk.networkState === "error" ? (
            <DeskErrorState onRetry={desk.retry} />
          ) : null}

          {desk.networkState === "ready" ? (
            <div className="desk-main-enter atelier-main mx-auto w-full">
              <AtelierHero
                greeting={desk.dailyBrief.greeting}
                teacherName={desk.dailyBrief.teacherName}
              />

              <CreateActionsSection />

              <ContinueWorkingSection
                projects={desk.recentProjects}
                onContinue={desk.continueExperience}
                onCreate={desk.createExperience}
              />

              <PrimaRecommendationsSection
                onAction={() => {
                  if (desk.focusExperienceId) {
                    desk.continueExperience(desk.focusExperienceId);
                  } else {
                    desk.createExperience();
                  }
                }}
              />

              <ActivityImpactSection impact={desk.atelierImpact} />
            </div>
          ) : null}
        </>
      }
    />
  );
}

export default TeacherDeskPage;
