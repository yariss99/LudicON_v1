const ACTIVITY_TYPES = [
  {
    emoji: "📖",
    title: "Lecție",
    description: "Planificare completă",
  },
  {
    emoji: "📄",
    title: "Fișă de lucru",
    description: "Exerciții și aplicații",
  },
  {
    emoji: "🎮",
    title: "Joc didactic",
    description: "Învățare prin joc",
  },
  {
    emoji: "📊",
    title: "Evaluare",
    description: "Teste și feedback",
  },
  {
    emoji: "🎭",
    title: "Poveste educațională",
    description: "Narațiune educațională",
  },
  {
    emoji: "🧩",
    title: "Escape Room",
    description: "Misiune interactivă",
  },
] as const;

function ActivityTypeCard({
  emoji,
  title,
  description,
}: (typeof ACTIVITY_TYPES)[number]) {
  return (
    <button
      type="button"
      className="flex w-full cursor-pointer flex-col items-start rounded-[24px] bg-white p-5 text-left shadow-[0_2px_16px_rgba(15,23,42,0.05)] ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-[0_8px_28px_rgba(37,99,235,0.12)] hover:ring-blue-500"
    >
      <span className="text-3xl" aria-hidden>
        {emoji}
      </span>
      <span className="mt-4 text-[15px] font-semibold tracking-tight text-slate-900">
        {title}
      </span>
      <span className="mt-1 text-sm leading-snug text-slate-500">
        {description}
      </span>
    </button>
  );
}

function PrimaInfoCard() {
  return (
    <aside className="rounded-[24px] bg-gradient-to-b from-blue-50/80 to-indigo-50/40 p-6 ring-1 ring-blue-100/60">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>
          ✨
        </span>
        <span className="text-sm font-semibold tracking-tight text-indigo-700">
          PRIMA
        </span>
      </div>

      <p className="mt-4 text-[15px] font-medium leading-snug text-slate-900">
        Alegerea tipului de activitate definește structura planificării.
      </p>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Fiecare format are obiective pedagogice diferite. Poți schimba alegerea
        oricând înainte de generare.
      </p>

      <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-white/80">
        <p className="text-[13px] leading-relaxed text-slate-600">
          <span aria-hidden>💡 </span>
          Nu ești sigur? Începe cu o{" "}
          <span className="font-medium text-slate-800">Lecție</span> — este cel
          mai flexibil punct de plecare.
        </p>
      </div>
    </aside>
  );
}

function PPlanning() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5 py-16 font-sans antialiased">
      <div className="w-full max-w-[850px]">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            <span aria-hidden>✨ </span>
            PRIMA
          </h1>
          <p className="mt-3 text-lg text-slate-500">Planificare pedagogică</p>

          <div
            className="mt-8 inline-flex items-center gap-3"
            aria-label="Pasul 1 din 5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              P
            </span>
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full bg-blue-600"
                aria-hidden
              />
              {[0, 1, 2, 3].map((step) => (
                <span
                  key={step}
                  className="h-2.5 w-2.5 rounded-full border-2 border-slate-200 bg-white"
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </header>

        <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_2px_40px_rgba(0,0,0,0.06)] ring-1 ring-slate-100/80">
          <div className="px-8 py-10 sm:px-10 sm:py-12">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]">
              Ce dorești să creezi?
            </h2>
            <p className="mt-2 text-base text-slate-500 sm:text-[17px]">
              Alege tipul activității pe care dorești să o proiectăm.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_220px] lg:gap-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {ACTIVITY_TYPES.map((activity) => (
                  <ActivityTypeCard key={activity.title} {...activity} />
                ))}
              </div>

              <div className="lg:pt-0">
                <PrimaInfoCard />
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default PPlanning;
