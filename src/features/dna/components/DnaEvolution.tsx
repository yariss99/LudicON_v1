import type { DnaYearSnapshot } from "../../../types/pedagogicalDna";

type DnaEvolutionProps = {
  evolution: DnaYearSnapshot[];
};

function DnaEvolution({ evolution }: DnaEvolutionProps) {
  return (
    <section>
      <header className="mb-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Evolution
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          How your practice changed
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Across school years — a story of craft, not comparison.
        </p>
      </header>

      <ol className="space-y-4">
        {evolution.map((year, index) => (
          <li
            key={year.schoolYear}
            className="relative flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {index + 1}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">
                {year.schoolYear}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {year.note}
              </p>
              {year.signatureLabels.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {year.signatureLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium capitalize text-emerald-700"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default DnaEvolution;
