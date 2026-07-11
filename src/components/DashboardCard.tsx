import "./DashboardCard.css";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string;
  to: string;
  Icon: LucideIcon;
};

function DashboardCard({ title, to, Icon }: DashboardCardProps) {
  return (
    <Link to={to} className="dashboard-link">
      <button className="dashboard-card">
        <Icon size={34} className="icon" />
        <span>{title}</span>
      </button>
    </Link>
  );
}

export default DashboardCard;