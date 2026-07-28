import { Button } from "../../../components/ui";

type ProjectEmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustrated?: boolean;
};

function EmptyIllustration() {
  return (
    <div
      className="mx-auto mb-6 flex h-28 w-28 items-center justify-center"
      aria-hidden
    >
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="18"
          y="34"
          width="84"
          height="62"
          rx="14"
          className="fill-slate-100 stroke-slate-200"
          strokeWidth="2"
        />
        <path
          d="M18 52h84"
          className="stroke-slate-200"
          strokeWidth="2"
        />
        <rect
          x="34"
          y="22"
          width="34"
          height="18"
          rx="6"
          className="fill-blue-50 stroke-blue-100"
          strokeWidth="2"
        />
        <circle cx="46" cy="72" r="6" className="fill-blue-100" />
        <circle cx="62" cy="72" r="6" className="fill-slate-200" />
        <circle cx="78" cy="72" r="6" className="fill-slate-200" />
      </svg>
    </div>
  );
}

function ProjectEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  illustrated = false,
}: ProjectEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center shadow-[0_8px_32px_rgba(15,23,42,0.04)]">
      {illustrated ? (
        <EmptyIllustration />
      ) : (
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-50" />
      )}
      <p className="text-lg font-medium text-slate-800">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button
            type="button"
            variant="primary"
            className="!rounded-xl"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default ProjectEmptyState;
