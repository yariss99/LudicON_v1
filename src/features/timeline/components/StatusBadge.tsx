import type { TimelineStatus } from "../../../types/timeline";
import { STATUS_LABEL, STATUS_STYLE } from "../constants";

type StatusBadgeProps = {
  status: TimelineStatus;
};

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default StatusBadge;
