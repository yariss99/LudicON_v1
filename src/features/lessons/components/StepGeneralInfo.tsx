import { Input, Select } from "../../../components/ui";
import type { LessonFormErrors, LessonGeneralInfo } from "../../../types/lesson";
import {
  PROJECT_GRADES,
  PROJECT_SUBJECTS,
} from "../../projects/constants";
import { LESSON_DURATIONS } from "../constants";

type StepGeneralInfoProps = {
  value: LessonGeneralInfo;
  errors: LessonFormErrors;
  onChange: (value: LessonGeneralInfo) => void;
};

function StepGeneralInfo({ value, errors, onChange }: StepGeneralInfoProps) {
  const update = <K extends keyof LessonGeneralInfo>(
    key: K,
    next: LessonGeneralInfo[K],
  ) => onChange({ ...value, [key]: next });

  return (
    <div className="space-y-4">
      <Input
        label="Titlu lecție"
        name="title"
        value={value.title}
        onChange={(event) => update("title", event.target.value)}
        placeholder="ex. Fracții echivalente"
        required
        error={errors.title}
        autoFocus
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Disciplină"
          name="subject"
          value={value.subject}
          onChange={(event) => update("subject", event.target.value)}
          options={PROJECT_SUBJECTS}
          placeholder="Alege disciplina"
          required
          error={errors.subject}
        />
        <Select
          label="Clasă"
          name="grade"
          value={value.grade}
          onChange={(event) => update("grade", event.target.value)}
          options={PROJECT_GRADES}
          placeholder="Alege clasa"
          required
          error={errors.grade}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Durată"
          name="duration"
          value={String(value.duration)}
          onChange={(event) =>
            update("duration", Number(event.target.value) || 45)
          }
          options={LESSON_DURATIONS.map((minutes) => ({
            value: String(minutes),
            label: `${minutes} minute`,
          }))}
          required
          error={errors.duration}
        />
        <Input
          label="Dată"
          name="date"
          type="date"
          value={value.date}
          onChange={(event) => update("date", event.target.value)}
          required
          error={errors.date}
        />
      </div>

      <Input
        label="Autor"
        name="author"
        value={value.author}
        onChange={(event) => update("author", event.target.value)}
        required
        error={errors.author}
      />
    </div>
  );
}

export default StepGeneralInfo;
