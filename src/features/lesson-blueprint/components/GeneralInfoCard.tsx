import type { LearningContextFacts } from "../../../engines/decision";
import {
  EMPTY_SECTION_HINT,
  LESSON_TYPE_OPTIONS,
} from "../constants";
import EditableCard from "./EditableCard";

type GeneralInfoCardProps = {
  collapsed: boolean;
  onToggle: () => void;
  value: LearningContextFacts;
  lessonType?: string;
  onChange: (value: LearningContextFacts) => void;
  onLessonTypeChange: (lessonType: string) => void;
  readOnly?: boolean;
};

function GeneralInfoCard({
  collapsed,
  onToggle,
  value,
  lessonType,
  onChange,
  onLessonTypeChange,
  readOnly,
}: GeneralInfoCardProps) {
  const empty = !value.subject && !value.grade && !value.topic;

  return (
    <EditableCard
      id="lesson-card-general"
      title="Informații generale"
      collapsed={collapsed}
      onToggle={onToggle}
      readOnly={readOnly}
      hint={empty ? EMPTY_SECTION_HINT : undefined}
      showAddInfo={empty && !readOnly}
      onAddInfo={() => onChange({ ...value, subject: value.subject ?? "" })}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Disciplina"
          value={value.subject ?? ""}
          onChange={(subject) => onChange({ ...value, subject })}
          placeholder="ex. Matematică"
          readOnly={readOnly}
        />
        <Field
          label="Clasa"
          value={value.grade ?? ""}
          onChange={(grade) => onChange({ ...value, grade })}
          placeholder="ex. a III-a"
          readOnly={readOnly}
        />
        <Field
          label="Tema"
          value={value.topic ?? ""}
          onChange={(topic) => onChange({ ...value, topic })}
          placeholder="ex. Fracții"
          readOnly={readOnly}
        />
        <Field
          label="Durata"
          value={value.durationMinutes ? String(value.durationMinutes) : ""}
          onChange={(raw) => {
            const n = Number.parseInt(raw, 10);
            onChange({
              ...value,
              durationMinutes: Number.isFinite(n) && n > 0 ? n : undefined,
            });
          }}
          placeholder="ex. 45"
          suffix="min"
          readOnly={readOnly}
        />
        <label className="block sm:col-span-2 lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Tipul lecției
          </span>
          <select
            value={lessonType ?? ""}
            disabled={readOnly}
            onChange={(e) => onLessonTypeChange(e.target.value)}
            className="mt-1.5 w-full rounded-2xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-70"
          >
            <option value="">Alege tipul lecției</option>
            {LESSON_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </EditableCard>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  readOnly,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suffix?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <div className="relative mt-1.5">
        <input
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400 disabled:opacity-70"
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

export default GeneralInfoCard;
