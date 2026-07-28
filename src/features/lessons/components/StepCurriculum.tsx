import type { LessonCurriculum, LessonFormErrors } from "../../../types/lesson";
import {
  GENERAL_COMPETENCIES,
  LEARNING_OBJECTIVES,
  SPECIFIC_COMPETENCIES,
} from "../constants";
import OptionChipGroup from "./OptionChipGroup";

type StepCurriculumProps = {
  value: LessonCurriculum;
  errors: LessonFormErrors;
  onChange: (value: LessonCurriculum) => void;
};

function StepCurriculum({ value, errors, onChange }: StepCurriculumProps) {
  return (
    <div className="space-y-6">
      <OptionChipGroup
        label="Competențe generale"
        options={GENERAL_COMPETENCIES}
        values={value.generalCompetencies}
        onChange={(generalCompetencies) =>
          onChange({ ...value, generalCompetencies })
        }
        error={errors.generalCompetencies}
        hint="Selectează una sau mai multe."
      />
      <OptionChipGroup
        label="Competențe specifice"
        options={SPECIFIC_COMPETENCIES}
        values={value.specificCompetencies}
        onChange={(specificCompetencies) =>
          onChange({ ...value, specificCompetencies })
        }
        error={errors.specificCompetencies}
        hint="Selectează una sau mai multe."
      />
      <OptionChipGroup
        label="Obiective de învățare"
        options={LEARNING_OBJECTIVES}
        values={value.learningObjectives}
        onChange={(learningObjectives) =>
          onChange({ ...value, learningObjectives })
        }
        error={errors.learningObjectives}
        hint="Selectează una sau mai multe."
      />
    </div>
  );
}

export default StepCurriculum;
