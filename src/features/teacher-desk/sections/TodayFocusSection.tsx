import {
  CREATE_EXPERIENCE_LABEL,
  TODAY_FOCUS_EMPTY,
} from "../constants";
import ActionCard from "../components/ActionCard";
import SectionHeader from "../components/SectionHeader";
import TodayFocusCard from "../components/TodayFocusCard";
import type { TodayFocusView } from "../types";

type TodayFocusSectionProps = {
  focus: TodayFocusView | null;
  onContinue: (projectId: string) => void;
  onCreate: () => void;
};

function TodayFocusSection({
  focus,
  onContinue,
  onCreate,
}: TodayFocusSectionProps) {
  return (
    <section
      className="flex h-full flex-col"
      aria-labelledby="today-focus-heading"
    >
      <SectionHeader
        id="today-focus-heading"
        title="Today's Focus"
        description="Where you stopped — and what to do next."
      />

      {focus ? (
        <TodayFocusCard
          focus={focus}
          onContinue={() => onContinue(focus.experience.id)}
        />
      ) : (
        <ActionCard className="text-center">
          <p className="text-lg font-medium leading-relaxed text-slate-800 sm:text-xl">
            {TODAY_FOCUS_EMPTY}
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

export default TodayFocusSection;
