import { Link } from "react-router-dom";
import type { QuickAccessItem } from "../types";
import {
  DESK_CARD_HOVER_SHADOW,
  DESK_CARD_RADIUS,
  DESK_CARD_SHADOW,
  DESK_RING,
} from "../constants";

type QuickAccessCardProps = {
  item: QuickAccessItem;
};

const cardClass = [
  DESK_CARD_RADIUS,
  DESK_CARD_SHADOW,
  DESK_CARD_HOVER_SHADOW,
  DESK_RING,
  "group flex h-full flex-col bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 sm:p-7",
].join(" ");

function QuickAccessCard({ item }: QuickAccessCardProps) {
  const Icon = item.icon;
  const body = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white transition-transform duration-300 group-hover:scale-105">
        <Icon size={22} strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="mt-5 text-base font-semibold text-slate-900">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {item.description}
      </p>
    </>
  );

  if (item.disabled || !item.href) {
    return (
      <button
        type="button"
        disabled
        className={`${cardClass} cursor-not-allowed opacity-60`}
        title="Coming soon"
        aria-label={`${item.title} — coming soon`}
      >
        {body}
      </button>
    );
  }

  if (item.href.startsWith("#")) {
    return (
      <a href={item.href} className={`${cardClass} no-underline`}>
        {body}
      </a>
    );
  }

  return (
    <Link to={item.href} className={`${cardClass} no-underline`}>
      {body}
    </Link>
  );
}

export default QuickAccessCard;
