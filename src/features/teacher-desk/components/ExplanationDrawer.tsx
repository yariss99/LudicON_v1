type ExplanationDrawerProps = {
  open: boolean;
  whyItMatters: string;
  expectedImpact: string;
};

function ExplanationDrawer({
  open,
  whyItMatters,
  expectedImpact,
}: ExplanationDrawerProps) {
  return (
    <div
      id="insight-explanation-drawer"
      className={[
        "overflow-hidden transition-all duration-300 ease-out",
        open ? "mt-6 max-h-96 opacity-100" : "mt-0 max-h-0 opacity-0",
      ].join(" ")}
      aria-hidden={!open}
    >
      <div className="rounded-2xl bg-slate-50/90 px-5 py-5 ring-1 ring-slate-200/70">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Why it matters
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {whyItMatters}
        </p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Expected impact
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {expectedImpact}
        </p>
      </div>
    </div>
  );
}

export default ExplanationDrawer;
