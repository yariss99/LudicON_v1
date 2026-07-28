import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { SurfaceCard } from "./ui";

type DashboardCardProps = {
  title: string;
  to: string;
  Icon: LucideIcon;
};

function DashboardCard({ title, to, Icon }: DashboardCardProps) {
  return (
    <Link to={to} className="group block no-underline text-inherit">
      <SurfaceCard
        hover
        padding="md"
        className="flex h-[90px] items-center gap-[18px]"
      >
        <Icon
          size={34}
          className="shrink-0 text-indigo-600"
          aria-hidden
        />
        <span className="text-base font-medium text-slate-800 group-hover:text-indigo-700">
          {title}
        </span>
      </SurfaceCard>
    </Link>
  );
}

export default DashboardCard;
