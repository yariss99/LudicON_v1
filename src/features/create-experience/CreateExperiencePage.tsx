import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FirstConversation from "./components/FirstConversation";
import LearningCanvas from "./components/LearningCanvas";
import { useCreateExperience } from "./hooks/useCreateExperience";

/**
 * CE-001 / CE-002 / CE-003 — Conversation builds. Canvas reflects.
 */
function CreateExperiencePage() {
  const experience = useCreateExperience();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased">
      <header className="border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-slate-500 no-underline hover:bg-slate-50 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <ArrowLeft size={16} aria-hidden />
              Biroul meu
            </Link>
            <div className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Creează o lecție
              </p>
              <p className="text-[11px] text-slate-400">
                Spune-mi despre lecția ta · Planul se umple pe parcurs
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:gap-10 lg:py-12">
        <main className="min-w-0">
          <FirstConversation
            input={experience.input}
            onInputChange={experience.setInput}
            onContinue={() => {
              void experience.continueConversation();
            }}
            onSecondarySelect={experience.handleSecondarySelect}
            streaming={experience.streaming}
            error={experience.phaseError}
            onRetry={experience.retryLast}
            latestPrimaMessage={experience.latestPrimaMessage}
            conversationStarted={experience.conversationStarted}
            canOpenReview={experience.canOpenWorkspace}
            onOpenReview={experience.openWorkspace}
          />

          {experience.panelLayout === "collapsible" ? (
            <div className="mt-10">
              <LearningCanvas
                canvas={experience.learningCanvas}
                layout="collapsible"
                open={experience.panelOpen}
                onOpenChange={experience.setPanelOpen}
              />
            </div>
          ) : null}
        </main>

        {experience.panelLayout === "sticky" ? (
          <LearningCanvas
            canvas={experience.learningCanvas}
            layout="sticky"
            open={experience.panelOpen}
            onOpenChange={experience.setPanelOpen}
          />
        ) : null}
      </div>

      {experience.panelLayout === "drawer" ? (
        <LearningCanvas
          canvas={experience.learningCanvas}
          layout="drawer"
          open={experience.panelOpen}
          onOpenChange={experience.setPanelOpen}
        />
      ) : null}
    </div>
  );
}

export default CreateExperiencePage;
