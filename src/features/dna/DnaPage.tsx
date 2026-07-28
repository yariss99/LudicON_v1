import { Link } from "react-router-dom";
import { Download, Fingerprint, Sparkles } from "lucide-react";
import AdaptedSuggestions from "./components/AdaptedSuggestions";
import DimensionCards from "./components/DimensionCards";
import DnaEvolution from "./components/DnaEvolution";
import SignatureConstellation from "./components/SignatureConstellation";
import { usePedagogicalDna } from "./hooks/usePedagogicalDna";

function DnaPage() {
  const { profile, exportMarkdown, exportJson } = usePedagogicalDna();

  return (
    <div className="dna-shell min-h-screen text-slate-900 antialiased">
      <div className="dna-atmosphere pointer-events-none fixed inset-0" aria-hidden />

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">PRIMA</p>
            <p className="text-[11px] text-slate-400">Pedagogical DNA</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            to="/classroom"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline hover:bg-white/80 hover:text-slate-800"
          >
            Memory
          </Link>
          <Link
            to="/desk"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline hover:bg-white/80 hover:text-slate-800"
          >
            Desk
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-24 sm:px-8">
        <header className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/60">
            <Fingerprint size={13} />
            Teaching profile · never a score
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.25rem]">
            {profile.teacherFirstName}&apos;s Pedagogical DNA
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {profile.summary}
          </p>

          <div className="mt-6">
            <SignatureConstellation styles={profile.signatureStyles} />
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Drawn from {profile.experienceCount} experience
            {profile.experienceCount === 1 ? "" : "s"} and{" "}
            {profile.reflectionCount} class reflection
            {profile.reflectionCount === 1 ? "" : "s"} — patterns only.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportMarkdown}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Download size={15} />
              Export for portfolio
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition-colors hover:text-slate-900"
            >
              Export JSON
            </button>
          </div>
        </header>

        <DimensionCards dimensions={profile.dimensions} />

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <DnaEvolution evolution={profile.evolution} />
          <AdaptedSuggestions suggestions={profile.adaptedSuggestions} />
        </div>
      </main>
    </div>
  );
}

export default DnaPage;
