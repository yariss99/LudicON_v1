import { useEffect, useState } from "react";
import { X } from "lucide-react";

type MorningNoteProps = {
  onAction: () => void;
};

/**
 * Delightful surprise: a soft paper note that arrives after a breath —
 * like a sticky note a colleague left on your desk.
 */
function MorningNote({ onAction }: MorningNoteProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("prima.home.morningNote");
    if (seen) return;
    const timer = window.setTimeout(() => setVisible(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  if (dismissed || !visible) return null;

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("prima.home.morningNote", "1");
  };

  return (
    <div className="desk-note fixed bottom-6 right-6 z-40 w-[min(320px,calc(100vw-2rem))] rotate-[-1.5deg]">
      <div className="relative rounded-sm bg-[#FFF8E7] px-5 py-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-amber-900/40 hover:bg-amber-100 hover:text-amber-950"
          aria-label="Dismiss note"
        >
          <X size={14} />
        </button>
        <p className="pr-6 font-[Georgia,serif] text-sm leading-relaxed text-amber-950">
          Next class in a little while — Math.
          <br />
          Want PRIMA to draft that worksheet while you finish coffee?
        </p>
        <button
          type="button"
          onClick={() => {
            onAction();
            dismiss();
          }}
          className="mt-3 text-sm font-semibold text-amber-950 underline decoration-amber-300 underline-offset-4"
        >
          Yes, draft it
        </button>
      </div>
    </div>
  );
}

export default MorningNote;
