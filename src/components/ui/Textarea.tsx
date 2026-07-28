import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

function Textarea({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <textarea
        id={inputId}
        className={[
          "min-h-[96px] w-full resize-y rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-shadow",
          "placeholder:text-slate-400",
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100",
          className,
        ].join(" ")}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        {...props}
      />
      {error ? (
        <span
          id={`${inputId}-error`}
          className="mt-1.5 block text-xs font-medium text-rose-600"
        >
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="mt-1.5 block text-xs text-slate-400">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export default Textarea;
