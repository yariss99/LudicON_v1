type PrimaMessageProps = {
  content: string;
};

function PrimaMessage({ content }: PrimaMessageProps) {
  return (
    <div className="flex justify-start gap-3">
      <div
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[10px] font-semibold text-sky-800 ring-1 ring-sky-100"
        aria-hidden
      >
        P
      </div>
      <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-bl-lg bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm ring-1 ring-slate-200/70">
        {content}
      </div>
    </div>
  );
}

export default PrimaMessage;
