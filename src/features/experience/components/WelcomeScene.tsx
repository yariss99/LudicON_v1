import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { teacherProfile } from "../../../data/workspaceData";
import PromptInput from "../../studio/components/PromptInput";
import { DEMO_INTENTION } from "../constants";

type WelcomeSceneProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bună dimineața";
  if (hour < 18) return "Bună ziua";
  return "Bună seara";
}

function WelcomeScene({
  prompt,
  onPromptChange,
  onSubmit,
}: WelcomeSceneProps) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowHint(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 pb-16">
      <div className="studio-hero-enter w-full max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.1]">
          {greeting()}, {teacherProfile.firstName}!
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-xl text-slate-500 sm:text-2xl">
          Ești gata să pregătești lecția de azi?
        </p>
      </div>

      <div className="studio-prompt-enter mt-10 w-full max-w-2xl">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
          onSubmit={onSubmit}
          placeholder="Ce ai dori să trăiască elevii tăi astăzi?"
        />
      </div>

      {showHint ? (
        <button
          type="button"
          onClick={() => onPromptChange(DEMO_INTENTION)}
          className="desk-enter mt-6 max-w-xl rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-left text-sm text-slate-500 transition-all hover:border-slate-300 hover:text-slate-800"
        >
          Încearcă: „{DEMO_INTENTION}”
        </button>
      ) : (
        <div className="mt-6 h-10" />
      )}

      <Link
        to="/timeline"
        className="mt-10 text-sm font-medium text-slate-400 no-underline transition-colors hover:text-slate-700"
      >
        Sau deschide calendarul anului școlar →
      </Link>
    </div>
  );
}

export default WelcomeScene;
