type ImpactBadgeProps = {
  label: string;
};

function ImpactBadge({ label }: ImpactBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-800/90 ring-1 ring-emerald-100">
      {label}
    </span>
  );
}

export default ImpactBadge;
