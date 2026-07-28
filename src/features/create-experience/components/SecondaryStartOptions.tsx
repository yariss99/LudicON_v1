import { SECONDARY_OPTIONS } from "../constants";

export type SecondaryOptionId = (typeof SECONDARY_OPTIONS)[number]["id"];

type SecondaryStartOptionsProps = {
  onSelect: (id: SecondaryOptionId) => void;
};

function SecondaryStartOptions({ onSelect }: SecondaryStartOptionsProps) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      role="group"
      aria-label="Other ways to begin"
    >
      {SECONDARY_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          disabled={!option.available}
          title={option.available ? undefined : "Coming soon"}
          onClick={() => onSelect(option.id)}
          className={[
            "rounded-2xl px-4 py-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2",
            option.available
              ? "bg-white ring-1 ring-slate-200/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
              : "cursor-not-allowed bg-slate-50 text-slate-400 ring-1 ring-slate-100",
          ].join(" ")}
        >
          <p
            className={[
              "text-sm font-semibold",
              option.available ? "text-slate-900" : "text-slate-400",
            ].join(" ")}
          >
            {option.label}
          </p>
          <p
            className={[
              "mt-1 text-xs leading-relaxed",
              option.available ? "text-slate-500" : "text-slate-400",
            ].join(" ")}
          >
            {option.description}
          </p>
        </button>
      ))}
    </div>
  );
}

export default SecondaryStartOptions;
