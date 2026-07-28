import ActivitiesTimelineCard from "./components/ActivitiesTimelineCard";
import AssessmentCard from "./components/AssessmentCard";
import CompetenciesCard from "./components/CompetenciesCard";
import GeneralInfoCard from "./components/GeneralInfoCard";
import LessonSummaryPanel from "./components/LessonSummaryPanel";
import MaterialsChecklistCard from "./components/MaterialsChecklistCard";
import ObjectivesCard from "./components/ObjectivesCard";
import ProgressOverlay from "./components/ProgressOverlay";
import StudioHeader from "./components/StudioHeader";
import VersionHistoryPanel from "./components/VersionHistoryPanel";
import { useLessonBlueprint } from "./hooks/useLessonBlueprint";
import { Link } from "react-router-dom";

/**
 * FEATURE-001 — Lesson Blueprint Studio (Product Spec v1.0)
 * Canonical editable lesson workspace before teaching materials.
 */
function LessonBlueprintPage() {
  const studio = useLessonBlueprint();

  if (studio.uiState === "loading") {
    return (
      <div className="min-h-screen bg-[#F4F5F7] px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-56 animate-pulse rounded-full bg-slate-200" />
          <div className="h-40 animate-pulse rounded-3xl bg-slate-200/80" />
          <div className="h-40 animate-pulse rounded-3xl bg-slate-200/70" />
        </div>
      </div>
    );
  }

  if (studio.uiState === "empty" || !studio.doc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F5F7] px-6 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Nu ai început încă o lecție
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          Spune-mi despre lecția pe care dorești să o pregătești, iar PRIMA te va
          ghida pas cu pas.
        </p>
        <Link
          to="/create/experience"
          className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline"
        >
          Începe conversația
        </Link>
      </div>
    );
  }

  const doc = studio.doc;
  const blueprint = doc.blueprint;
  const ctx = blueprint.learningContext;

  return (
    <div className="min-h-screen bg-[#F4F5F7] pb-24 text-slate-900 antialiased lg:pb-8">
      <StudioHeader
        subject={ctx.subject}
        grade={ctx.grade}
        topic={ctx.topic}
        saving={studio.saving}
        updatedAt={doc.updatedAt}
      />

      {studio.readOnly ? (
        <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950">
          Pe telefon poți citi proiectul lecției. Pentru editare, folosește
          tableta sau calculatorul.
        </div>
      ) : null}

      {studio.error ? (
        <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6">
          <div
            role="alert"
            className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-100"
          >
            {studio.error}
          </div>
        </div>
      ) : null}

      {studio.notice ? (
        <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6">
          <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-950 ring-1 ring-sky-100">
            {studio.notice}
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1400px] gap-6 px-3 py-6 sm:px-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.75fr)] lg:gap-8 lg:px-6 lg:py-8">
        <main className="min-w-0 space-y-5">
          <GeneralInfoCard
            collapsed={Boolean(studio.collapsed.general)}
            onToggle={() => studio.toggleCard("general")}
            value={blueprint.learningContext}
            lessonType={studio.lessonType}
            onChange={(learningContext) =>
              studio.updateBlueprint((bp) => ({ ...bp, learningContext }))
            }
            onLessonTypeChange={studio.updateLessonType}
            readOnly={studio.readOnly}
          />

          <CompetenciesCard
            collapsed={Boolean(studio.collapsed.competencies)}
            onToggle={() => studio.toggleCard("competencies")}
            items={blueprint.competencies}
            onChange={studio.updateCompetencies}
            readOnly={studio.readOnly}
          />

          <ObjectivesCard
            collapsed={Boolean(studio.collapsed.objectives)}
            onToggle={() => studio.toggleCard("objectives")}
            items={blueprint.objectives}
            onChange={studio.updateObjectives}
            readOnly={studio.readOnly}
          />

          <ActivitiesTimelineCard
            collapsed={Boolean(studio.collapsed.activities)}
            onToggle={() => studio.toggleCard("activities")}
            activities={studio.activities}
            onChange={studio.updateActivities}
            readOnly={studio.readOnly}
          />

          <AssessmentCard
            collapsed={Boolean(studio.collapsed.assessment)}
            onToggle={() => studio.toggleCard("assessment")}
            value={studio.assessmentBlock}
            onChange={studio.updateAssessment}
            readOnly={studio.readOnly}
          />

          <MaterialsChecklistCard
            collapsed={Boolean(studio.collapsed.materials)}
            onToggle={() => studio.toggleCard("materials")}
            selected={studio.plannedMaterials}
            onChange={studio.setPlannedMaterials}
            readOnly={studio.readOnly}
          />

          <VersionHistoryPanel
            versions={studio.editHistory}
            onRestore={studio.restoreVersion}
            readOnly={studio.readOnly}
          />
        </main>

        <div className="order-first lg:order-none">
          <LessonSummaryPanel
            blueprint={blueprint}
            plannedMaterials={studio.plannedMaterials}
            activityCount={studio.activities.length}
            saving={studio.saving}
            creating={studio.creating}
            readOnly={studio.readOnly}
            onSave={studio.saveNow}
            onPreview={studio.previewLesson}
            onExport={studio.exportLesson}
            onCreateMaterials={() => {
              void studio.createMaterials();
            }}
          />
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          disabled={studio.creating || studio.readOnly}
          onClick={() => {
            void studio.createMaterials();
          }}
          className="w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
        >
          {studio.creating ? "Pregătim…" : "Creează materialele"}
        </button>
      </footer>

      <ProgressOverlay open={studio.creating} />
    </div>
  );
}

export default LessonBlueprintPage;
