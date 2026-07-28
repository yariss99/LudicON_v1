import { Mic, Paperclip, Send } from "lucide-react";

type ConversationInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

function ConversationInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ConversationInputProps) {
  return (
    <form
      className="rounded-3xl bg-white p-3 shadow-[0_12px_40px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="sr-only" htmlFor="create-experience-input">
        Your message
      </label>
      <textarea
        id="create-experience-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
        rows={3}
        disabled={disabled}
        placeholder="Answer in your own words…"
        className="w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus-visible:ring-0 disabled:opacity-60"
      />
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            title="Voice — coming soon"
            aria-label="Voice input (coming soon)"
            className="rounded-full p-2 text-slate-300"
          >
            <Mic size={18} aria-hidden />
          </button>
          <button
            type="button"
            disabled
            title="Attachments — coming soon"
            aria-label="Attach file (coming soon)"
            className="rounded-full p-2 text-slate-300"
          >
            <Paperclip size={18} aria-hidden />
          </button>
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Send
          <Send size={14} aria-hidden />
        </button>
      </div>
    </form>
  );
}

export default ConversationInput;
