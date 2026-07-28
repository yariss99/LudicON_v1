import type { DnaDimensionView } from "../../../types/pedagogicalDna";
import PresencePill from "./PresencePill";

type DimensionCardsProps = {
  dimensions: DnaDimensionView[];
};

function DimensionCards({ dimensions }: DimensionCardsProps) {
  return (
    <section>
      <header className="mb-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Observed patterns
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          Your professional style
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Remembered gently — never judged, scored, or ranked.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {dimensions.map((dimension) => (
          <article
            key={dimension.id}
            className="rounded-3xl bg-white p-5 ring-1 ring-slate-200/70 shadow-sm shadow-slate-900/[0.02]"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              {dimension.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">{dimension.subtitle}</p>
            {dimension.highlight ? (
              <p className="mt-3 text-sm font-medium text-slate-800">
                Often: {dimension.highlight}
              </p>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Still gathering…</p>
            )}

            <ul className="mt-3 space-y-2">
              {dimension.patterns.slice(0, 3).map((pattern) => (
                <li key={pattern.id} className="rounded-xl bg-slate-50/90 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium capitalize text-slate-800">
                      {pattern.label}
                    </span>
                    <PresencePill presence={pattern.presence} />
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    {pattern.narrative}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DimensionCards;
