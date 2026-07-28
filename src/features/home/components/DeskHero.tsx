import { useEffect, useState } from "react";
import PromptInput from "../../studio/components/PromptInput";

const PLACEHOLDERS = [
  "Ce ai dori să trăiască elevii tăi astăzi?",
  "Un drum calm în fracții pentru clasa a III-a…",
  "Ajută-i pe elevi să exploreze plantele prin cercetare…",
  "Exersare care întâmpină fiecare elev acolo unde este…",
] as const;

type DeskHeroProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  spaceLabel?: string;
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bună dimineața";
  if (hour < 18) return "Bună ziua";
  return "Bună seara";
}

function DeskHero({
  prompt,
  onPromptChange,
  onSubmit,
  spaceLabel,
}: DeskHeroProps) {
  const [exampleIndex, setExampleIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExampleIndex((current) => (current + 1) % PLACEHOLDERS.length);
    }, 3800);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="desk-enter mb-8">
      {spaceLabel ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
          {spaceLabel}
        </p>
      ) : null}
      <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-[2.85rem] sm:leading-[1.08]">
        {greeting()}.
      </h1>
      <p className="mt-3 max-w-xl text-lg leading-relaxed text-slate-500 sm:text-xl">
        Focalizarea de azi e clară. Începe cu o intenție.
      </p>

      <div className="mt-8">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
          onSubmit={onSubmit}
          placeholder={PLACEHOLDERS[exampleIndex]}
        />
      </div>
    </section>
  );
}

export default DeskHero;
