import SectionHeader from "../components/SectionHeader";
import TimelineItem from "../components/TimelineItem";
import { DESK_SECTION_GAP } from "../constants";
import { TEACHING_TIMELINE } from "../services";

function TeachingTimelineSection() {
  return (
    <section
      className={DESK_SECTION_GAP}
      aria-labelledby="teaching-timeline-heading"
    >
      <SectionHeader
        id="teaching-timeline-heading"
        title="Teaching Timeline"
        description="Recent activity — newest first."
      />
      <ol className="space-y-3">
        {TEACHING_TIMELINE.map((item) => (
          <li key={item.id}>
            <TimelineItem item={item} />
          </li>
        ))}
      </ol>
    </section>
  );
}

export default TeachingTimelineSection;
