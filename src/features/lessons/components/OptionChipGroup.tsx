type OptionChipGroupProps = {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
  multiple?: boolean;
  hint?: string;
};

function OptionChipGroup({
  label,
  options,
  values,
  onChange,
  error,
  multiple = true,
  hint,
}: OptionChipGroupProps) {
  const toggle = (option: string) => {
    if (!multiple) {
      onChange(values.includes(option) ? [] : [option]);
      return;
    }

    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }
    onChange([...values, option]);
  };

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">{label}</legend>
      {hint ? <p className="mb-2 text-xs text-slate-400">{hint}</p> : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className={[
                "rounded-full px-3.5 py-2 text-sm transition-colors",
                selected
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </fieldset>
  );
}

export default OptionChipGroup;
