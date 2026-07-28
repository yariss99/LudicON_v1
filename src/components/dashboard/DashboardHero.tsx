import { Sparkles } from "lucide-react";
import { Button } from "../ui";

function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md lg:max-w-none">
      <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-[0_16px_48px_rgba(79,70,229,0.12)]" />

      <div className="animate-float absolute left-[12%] top-[18%] flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_rgba(79,70,229,0.15)]">
        <span className="text-2xl">📚</span>
      </div>

      <div className="animate-float-delayed absolute right-[14%] top-[22%] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-300/40">
        <Sparkles className="text-white" size={22} />
      </div>

      <div className="absolute bottom-[28%] left-[22%] h-20 w-20 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-400/20 blur-sm" />

      <div className="animate-float absolute bottom-[20%] right-[18%] flex h-20 w-20 items-center justify-center rounded-[24px] bg-white shadow-[0_8px_32px_rgba(15,23,42,0.08)]">
        <span className="text-3xl">🎮</span>
      </div>

      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[24px] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-xl shadow-indigo-400/30">
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-200">
            PRIMA
          </p>
          <p className="text-2xl font-bold text-white">AI</p>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-medium text-slate-500 backdrop-blur-sm">
        Illustration placeholder
      </div>
    </div>
  );
}

function DashboardHero() {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 px-6 py-12 shadow-[0_8px_32px_rgba(79,70,229,0.08)] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-blue-200/25 blur-3xl" />

      <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm backdrop-blur-sm">
            <Sparkles size={14} />
            Creative AI studio for teachers
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              Every great lesson starts with one idea.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-slate-500">
              Create engaging learning experiences powered by PRIMA AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button to="/create" variant="primary" size="lg">
              <span aria-hidden>✨</span>
              Create Activity
            </Button>
            <Button to="/assistant" variant="secondary" size="lg">
              <span aria-hidden>🤖</span>
              Ask PRIMA
            </Button>
          </div>
        </div>

        <div className="hidden lg:block">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;
