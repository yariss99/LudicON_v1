import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AppShell } from "../../components/layout";
import { Button, SurfaceCard } from "../../components/ui";
import { useProjects } from "../../context/ProjectContext";
import { LESSON_WIZARD_STEPS } from "./constants";
import LessonSuccess from "./components/LessonSuccess";
import LessonSummary from "./components/LessonSummary";
import StepCurriculum from "./components/StepCurriculum";
import StepGeneralInfo from "./components/StepGeneralInfo";
import StepLessonStyle from "./components/StepLessonStyle";
import StepTeachingDesign from "./components/StepTeachingDesign";
import WizardStepper from "./components/WizardStepper";
import { useLessonWizard } from "./hooks/useLessonWizard";

function LessonWizardPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const { getProject, refresh } = useProjects();
  const project = getProject(projectId);

  const {
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
  } = useLessonWizard(projectId);

  if (!project) {
    return (
      <AppShell>
        <p className="text-slate-600">Lecția nu a fost găsită.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-slate-700"
        >
          Înapoi la birou
        </Link>
      </AppShell>
    );
  }

  if (generatedLesson) {
    return (
      <AppShell>
        <LessonSuccess
          lesson={generatedLesson}
          onViewProject={() => {
            refresh();
            navigate(`/projects/${projectId}`);
          }}
          onCreateAnother={() => {
            resetWizard();
          }}
        />
      </AppShell>
    );
  }

  const isLastStep = currentStep === LESSON_WIZARD_STEPS.length - 1;

  return (
    <AppShell>
      <Link
        to={`/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 no-underline hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Înapoi la {project.title}
      </Link>

      <header className="mb-8 max-w-2xl">
        <p className="text-sm font-medium text-blue-600">Lesson Builder</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
          Lecție nouă
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Ghidează designul lecției pas cu pas — salvare automată între pași.
        </p>
      </header>

      <WizardStepper
        currentStep={currentStep}
        onStepSelect={(step) => {
          if (step <= currentStep) goToStep(step);
        }}
      />

      <SurfaceCard padding="lg" bordered className="mb-6">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {stepMeta.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{stepMeta.description}</p>
        </div>

        {currentStep === 0 ? (
          <StepGeneralInfo
            value={draft.general}
            errors={errors}
            onChange={setGeneral}
          />
        ) : null}
        {currentStep === 1 ? (
          <StepCurriculum
            value={draft.curriculum}
            errors={errors}
            onChange={setCurriculum}
          />
        ) : null}
        {currentStep === 2 ? (
          <StepTeachingDesign
            value={draft.teaching}
            errors={errors}
            onChange={setTeaching}
          />
        ) : null}
        {currentStep === 3 ? (
          <StepLessonStyle
            value={draft.style}
            error={errors.style}
            onChange={setStyle}
          />
        ) : null}
        {currentStep === 4 ? <LessonSummary draft={draft} /> : null}
      </SurfaceCard>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          Progresul se salvează automat în această lecție.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="!rounded-xl"
            onClick={back}
            disabled={currentStep === 0 || isGenerating}
          >
            Înapoi
          </Button>
          {isLastStep ? (
            <Button
              type="button"
              variant="primary"
              className="!rounded-xl"
              onClick={() => {
                void generate().then((lesson) => {
                  if (lesson) refresh();
                });
              }}
              disabled={isGenerating}
            >
              <Sparkles size={16} />
              {isGenerating ? "Se generează…" : "Generează lecția"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              className="!rounded-xl"
              onClick={() => next()}
            >
              Continuă
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default LessonWizardPage;
