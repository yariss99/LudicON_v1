import type { CanvasSectionView } from "../../types/canvas";
import CanvasAnimation from "./CanvasAnimation";
import CanvasStatus from "./CanvasStatus";

type CanvasSectionProps = {
  section: CanvasSectionView;
};

function CanvasSection({ section }: CanvasSectionProps) {
  const empty = section.lines.length === 0;
  const emphasize = section.isNew || section.isInferred;

  return (
    <CanvasAnimation active={emphasize}>
      <div
        className={[
          "px-3 py-3",
          section.criticalMissing ? "rounded-2xl ring-1 ring-amber-200/80" : "",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              {section.label}
            </p>
            {section.isInferred ? (
              <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                ✓ Dedus
              </span>
            ) : null}
            {section.isNew ? (
              <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                Nou
              </span>
            ) : null}
          </div>
          <CanvasStatus state={section.state} />
        </div>

        {empty ? (
          <p
            className={[
              "mt-2 text-sm",
              section.criticalMissing
                ? "font-medium text-amber-800/90"
                : "text-slate-300",
            ].join(" ")}
          >
            {section.criticalMissing ? "Necesar pentru următorul pas" : "—"}
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {section.lines.map((line) => (
              <li
                key={line}
                className="text-sm leading-relaxed text-slate-800"
              >
                {line}
                {section.isInferred ? (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-700">
                    ✓ Dedus
                  </span>
                ) : null}
                {section.isNew ? (
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700">
                    (Nou)
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </CanvasAnimation>
  );
}

export default CanvasSection;
