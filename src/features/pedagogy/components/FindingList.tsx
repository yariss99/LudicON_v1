import type { PedagogicalFinding } from "../../../types/pedagogy";

type FindingListProps = {
  title: string;
  empty: string;
  findings: PedagogicalFinding[];
  tone: "strength" | "suggestion" | "improvement";
};

const TONE: Record<
  FindingListProps["tone"],
  { dot: string; title: string }
> = {
  strength: {
    dot: "bg-emerald-400",
    title: "text-emerald-800",
  },
  suggestion: {
    dot: "bg-sky-400",
    title: "text-sky-900",
  },
  improvement: {
    dot: "bg-slate-300",
    title: "text-slate-700",
  },
};

function FindingList({ title, empty, findings, tone }: FindingListProps) {
  const style = TONE[tone];

  return (
    <section>
      <h3
        className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${style.title}`}
      >
        {title}
      </h3>
      {findings.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-400">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2.5">
          {findings.map((finding) => (
            <li
              key={finding.id}
              className="rounded-xl bg-slate-50/90 px-3 py-2.5 ring-1 ring-slate-100"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {finding.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {finding.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default FindingList;
