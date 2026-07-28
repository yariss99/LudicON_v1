import { Select } from "../../../components/ui";
import type {
  LessonFormErrors,
  LessonTeachingDesign,
} from "../../../types/lesson";
import {
  CLASSROOM_ORGANIZATIONS,
  TEACHING_MATERIALS,
  TEACHING_METHODS,
  TEACHING_RESOURCES,
} from "../constants";
import OptionChipGroup from "./OptionChipGroup";

type StepTeachingDesignProps = {
  value: LessonTeachingDesign;
  errors: LessonFormErrors;
  onChange: (value: LessonTeachingDesign) => void;
};

function StepTeachingDesign({
  value,
  errors,
  onChange,
}: StepTeachingDesignProps) {
  return (
    <div className="space-y-6">
      <OptionChipGroup
        label="Metode de predare"
        options={TEACHING_METHODS}
        values={value.teachingMethods}
        onChange={(teachingMethods) => onChange({ ...value, teachingMethods })}
        error={errors.teachingMethods}
      />
      <OptionChipGroup
        label="Resurse didactice"
        options={TEACHING_RESOURCES}
        values={value.teachingResources}
        onChange={(teachingResources) =>
          onChange({ ...value, teachingResources })
        }
        error={errors.teachingResources}
      />
      <OptionChipGroup
        label="Materiale"
        options={TEACHING_MATERIALS}
        values={value.teachingMaterials}
        onChange={(teachingMaterials) =>
          onChange({ ...value, teachingMaterials })
        }
        error={errors.teachingMaterials}
      />
      <Select
        label="Organizarea clasei"
        name="classroomOrganization"
        value={value.classroomOrganization}
        onChange={(event) =>
          onChange({ ...value, classroomOrganization: event.target.value })
        }
        options={CLASSROOM_ORGANIZATIONS}
        placeholder="Alege organizarea"
        required
        error={errors.classroomOrganization}
      />
    </div>
  );
}

export default StepTeachingDesign;
