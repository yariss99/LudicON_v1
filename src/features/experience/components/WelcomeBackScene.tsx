import { ArrowRight } from "lucide-react";
import type { LastWorkspaceMemory } from "../sessionMemory";

type WelcomeBackSceneProps = {
  memory: LastWorkspaceMemory;
  onContinue: () => void;
  onStartFresh: () => void;
};

function WelcomeBackScene({
  memory,
  onContinue,
  onStartFresh,
}: WelcomeBackSceneProps) {
  return (
    <div className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 pb-16">
      <div className="studio-hero-enter w-full max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Welcome back.
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          Yesterday you created:
        </p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {memory.title}
        </p>
        {memory.prompt ? (
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            “{memory.prompt}”
          </p>
        ) : null}
      </div>

      <div className="studio-prompt-enter mt-10 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-base font-medium text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition-transform hover:scale-[1.02]"
        >
          Continue
          <ArrowRight size={18} />
        </button>
        <button
          type="button"
          onClick={onStartFresh}
          className="rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          Start a new intention
        </button>
      </div>
    </div>
  );
}

export default WelcomeBackScene;
