import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

type PromptInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Describe what you want to create…",
  disabled = false,
  autoFocus = true,
}: PromptInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    ref.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="studio-prompt-enter w-full">
      <div className="relative rounded-[28px] border border-slate-200/80 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-shadow focus-within:border-slate-300 focus-within:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className="max-h-[180px] min-h-[72px] w-full resize-none border-0 bg-transparent px-4 py-3 pr-14 text-[17px] leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="Start planning"
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:hover:scale-100"
        >
          <ArrowUp size={18} strokeWidth={2.25} />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">
        Press Enter to begin · Shift + Enter for a new line
      </p>
    </form>
  );
}

export default PromptInput;
