import { useId } from "react";
import { Search, X } from "lucide-react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

function SearchInput({
  value,
  onChange,
  placeholder = "Search learning experiences...",
  label = "Search learning experiences",
  className = "",
}: SearchInputProps) {
  const inputId = useId();

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search
        size={18}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-900 shadow-[0_2px_12px_rgba(15,23,42,0.04)] outline-none transition-shadow placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Șterge căutarea"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
}

export default SearchInput;
