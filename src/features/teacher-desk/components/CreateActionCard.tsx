import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type CreateActionCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  accent?: "blue" | "green" | "amber";
};

function CreateActionCard({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  accent = "blue",
}: CreateActionCardProps) {
  const className =
    "atelier-card atelier-card--interactive group text-left no-underline focus-visible:outline-none";

  const body = (
    <div className="atelier-card-stack">
      <span className={`atelier-icon-well atelier-icon-well--${accent}`}>
        <Icon size={24} strokeWidth={1.5} aria-hidden />
      </span>
      <span className="atelier-card-title atelier-card-gap-lg">{title}</span>
      <span className="atelier-caption atelier-line-clamp-2 atelier-card-gap-sm">
        {description}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

export default CreateActionCard;
