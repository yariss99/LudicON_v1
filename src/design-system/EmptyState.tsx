import PrimaButton from "./PrimaButton";

type EmptyStateProps = {
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

function EmptyState({
  description = "Poți completa această secțiune acum sau mai târziu.",
  actionLabel = "Adaugă informații",
  onAction,
}: EmptyStateProps) {
  return (
    <div className="space-y-3 py-2">
      <p className="text-[var(--text-body)] leading-relaxed text-[var(--prima-text-muted)]">
        {description}
      </p>
      {onAction ? (
        <PrimaButton variant="primary" onClick={onAction}>
          {actionLabel}
        </PrimaButton>
      ) : null}
    </div>
  );
}

export default EmptyState;
