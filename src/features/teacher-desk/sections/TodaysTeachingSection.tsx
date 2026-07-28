import {
  CREATE_EXPERIENCE_LABEL,
  DESK_SECTION_GAP,
  TODAYS_TEACHING_EMPTY,
  TODAYS_TEACHING_SUBTITLE,
  TODAYS_TEACHING_TITLE,
} from "../constants";
import ActionCard from "../components/ActionCard";
import SectionHeader from "../components/SectionHeader";
import TodaysTeachingCard from "../components/TodaysTeachingCard";
import type { TodaysTeachingView } from "../types";

type TodaysTeachingSectionProps = {
  teaching: TodaysTeachingView | null;
  onContinue: (projectId: string) => void;
  onCreate: () => void;
};

function TodaysTeachingSection({
  teaching,
  onContinue,
  onCreate,
}: TodaysTeachingSectionProps) {
  return (
    <section
      className={DESK_SECTION_GAP}
      aria-labelledby="todays-teaching-heading"
    >
      <SectionHeader
        id="todays-teaching-heading"
        title={TODAYS_TEACHING_TITLE}
        description={TODAYS_TEACHING_SUBTITLE}
      />

      {teaching ? (
        <TodaysTeachingCard
          teaching={teaching}
          onContinue={() => onContinue(teaching.experienceId)}
        />
      ) : (
        <ActionCard className="text-center sm:text-left">
          <p className="max-w-xl text-lg leading-relaxed text-slate-700">
            {TODAYS_TEACHING_EMPTY}
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          >
            {CREATE_EXPERIENCE_LABEL}
          </button>
        </ActionCard>
      )}
    </section>
  );
}

export default TodaysTeachingSection;
