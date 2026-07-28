import PrimaButton from "./PrimaButton";
import PrimaMark from "./PrimaMark";

type FloatingSuggestionProps = {
  message: string;
  acceptLabel?: string;
  dismissLabel?: string;
  onAccept?: () => void;
  onDismiss?: () => void;
};

/**
 * Non-blocking adaptive tip inside the PRIMA panel.
 */
function FloatingSuggestion({
  message,
  acceptLabel = "Da, te rog",
  dismissLabel = "Nu acum",
  onAccept,
  onDismiss,
}: FloatingSuggestionProps) {
  return (
    <div className="prima-suggestion-enter rounded-[var(--radius-md)] bg-[var(--prima-primary-soft)] px-3.5 py-3 ring-1 ring-blue-100">
      <div className="flex items-start gap-2.5">
        <PrimaMark size={20} pulse={false} />
        <p className="text-sm leading-relaxed text-[var(--prima-text)]">
          {message}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {onAccept ? (
          <PrimaButton
            variant="primary"
            className="!min-h-8 !px-3 !py-1.5 !text-xs"
            onClick={onAccept}
          >
            {acceptLabel}
          </PrimaButton>
        ) : null}
        {onDismiss ? (
          <PrimaButton
            variant="ghost"
            className="!min-h-8 !px-3 !py-1.5 !text-xs"
            onClick={onDismiss}
          >
            {dismissLabel}
          </PrimaButton>
        ) : null}
      </div>
    </div>
  );
}

export default FloatingSuggestion;
