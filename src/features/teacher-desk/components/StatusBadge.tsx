type StatusBadgeProps = {
  label: string;
};

function StatusBadge({ label }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80">
      {label}
    </span>
  );
}

export default StatusBadge;
