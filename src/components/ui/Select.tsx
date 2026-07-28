import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: readonly SelectOption[] | readonly string[];
  error?: string;
  placeholder?: string;
};

function toOptions(
  options: readonly SelectOption[] | readonly string[],
): SelectOption[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

function Select({
  label,
  options,
  error,
  placeholder,
  id,
  className = "",
  ...props
}: SelectProps) {
  const inputId = id ?? props.name;
  const normalized = toOptions(options);

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {props.required ? (
          <span className="ml-0.5 text-rose-500" aria-hidden>
            *
          </span>
        ) : null}
      </span>
      <select
        id={inputId}
        className={[
          "w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-shadow",
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100",
          className,
        ].join(" ")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {normalized.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <span
          id={`${inputId}-error`}
          className="mt-1.5 block text-xs font-medium text-rose-600"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default Select;
