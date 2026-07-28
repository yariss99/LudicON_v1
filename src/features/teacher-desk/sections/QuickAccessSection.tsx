import QuickAccessCard from "../components/QuickAccessCard";
import SectionHeader from "../components/SectionHeader";
import { DESK_SECTION_GAP } from "../constants";
import { QUICK_ACCESS_ITEMS } from "../services";

function QuickAccessSection() {
  return (
    <section
      className={`${DESK_SECTION_GAP} mb-2`}
      aria-labelledby="quick-access-heading"
    >
      <SectionHeader
        id="quick-access-heading"
        title="Quick Access"
        description="Reach the spaces you use every day."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACCESS_ITEMS.map((item) => (
          <QuickAccessCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default QuickAccessSection;
