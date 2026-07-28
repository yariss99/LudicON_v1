import DashboardCard from "../DashboardCard";
import type { PlatformNavItem } from "../../types/dashboard";
import SectionHeader from "../ui/SectionHeader";

type PlatformShortcutsProps = {
  items: PlatformNavItem[];
};

function PlatformShortcuts({ items }: PlatformShortcutsProps) {
  return (
    <section>
      <SectionHeader
        title="Acces rapid"
        subtitle="Navigare principală a platformei"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <DashboardCard
            key={item.id}
            title={item.title}
            to={item.to}
            Icon={item.icon}
          />
        ))}
      </div>
    </section>
  );
}

export default PlatformShortcuts;
