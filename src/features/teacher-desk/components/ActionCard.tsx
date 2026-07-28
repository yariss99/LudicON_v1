import type { ReactNode } from "react";
import {
  DESK_CARD_HOVER_SHADOW,
  DESK_CARD_RADIUS,
  DESK_CARD_SHADOW,
  DESK_RING,
} from "../constants";

type ActionCardProps = {
  children: ReactNode;
  className?: string;
  emphasized?: boolean;
};

function ActionCard({
  children,
  className = "",
  emphasized = false,
}: ActionCardProps) {
  return (
    <div
      className={[
        DESK_CARD_RADIUS,
        DESK_CARD_SHADOW,
        DESK_CARD_HOVER_SHADOW,
        DESK_RING,
        "bg-white p-8 transition-shadow duration-300 sm:p-10",
        emphasized
          ? "bg-gradient-to-br from-white via-white to-sky-50/70 ring-sky-200/70"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export default ActionCard;
