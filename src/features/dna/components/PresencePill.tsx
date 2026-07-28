import type { DnaPresence } from "../../../types/pedagogicalDna";

const STYLE: Record<DnaPresence, string> = {
  signature: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  familiar: "bg-sky-50 text-sky-700 ring-sky-100",
  emerging: "bg-slate-50 text-slate-500 ring-slate-200/80",
};

const LABEL: Record<DnaPresence, string> = {
  signature: "Signature",
  familiar: "Familiar",
  emerging: "Emerging",
};

type PresencePillProps = {
  presence: DnaPresence;
};

function PresencePill({ presence }: PresencePillProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${STYLE[presence]}`}
    >
      {LABEL[presence]}
    </span>
  );
}

export default PresencePill;
