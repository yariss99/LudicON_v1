import {
  INSIGHT_ACCEPTED_BODY,
  INSIGHT_ACCEPTED_TITLE,
  INSIGHT_DISMISSED_BODY,
  INSIGHT_DISMISSED_TITLE,
  INSIGHT_EMPTY_BODY,
  INSIGHT_EMPTY_TITLE,
} from "../constants";
import type { InsightState } from "../types";

type EmptyInsightProps = {
  variant?: Extract<InsightState, "none" | "accepted" | "dismissed">;
};

function EmptyInsight({ variant = "none" }: EmptyInsightProps) {
  const copy =
    variant === "accepted"
      ? { title: INSIGHT_ACCEPTED_TITLE, body: INSIGHT_ACCEPTED_BODY }
      : variant === "dismissed"
        ? { title: INSIGHT_DISMISSED_TITLE, body: INSIGHT_DISMISSED_BODY }
        : { title: INSIGHT_EMPTY_TITLE, body: INSIGHT_EMPTY_BODY };

  return (
    <div className="flex flex-1 flex-col justify-center py-6 text-center sm:text-left">
      <p className="text-xl font-semibold tracking-tight text-slate-900">
        {copy.title}
      </p>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
        {copy.body}
      </p>
    </div>
  );
}

export default EmptyInsight;
