import type { LessonAssessmentBlock } from "../../blueprint-review/types";
import { EMPTY_SECTION_HINT } from "../constants";
import EditableCard from "./EditableCard";

type AssessmentCardProps = {
  collapsed: boolean;
  onToggle: () => void;
  value: LessonAssessmentBlock;
  onChange: (value: LessonAssessmentBlock) => void;
  readOnly?: boolean;
};

function AssessmentCard({
  collapsed,
  onToggle,
  value,
  onChange,
  readOnly,
}: AssessmentCardProps) {
  const empty =
    !value.method &&
    !value.tools &&
    !value.successCriteria &&
    !value.observationNotes;

  return (
    <EditableCard
      id="lesson-card-assessment"
      title="Evaluare"
      collapsed={collapsed}
      onToggle={onToggle}
      readOnly={readOnly}
      hint={empty ? EMPTY_SECTION_HINT : undefined}
      showAddInfo={empty && !readOnly}
      onAddInfo={() => onChange({ ...value, method: " " })}
    >
      <div className="grid gap-4">
        <Field
          label="Metoda de evaluare"
          value={value.method}
          onChange={(method) => onChange({ ...value, method })}
          placeholder="ex. Observare pe parcurs + bilet de ieșire"
          readOnly={readOnly}
        />
        <Field
          label="Instrumente de evaluare"
          value={value.tools}
          onChange={(tools) => onChange({ ...value, tools })}
          placeholder="ex. Fișă scurtă, semnale cu degetul, dialog ghidat"
          readOnly={readOnly}
        />
        <Field
          label="Criterii de succes"
          value={value.successCriteria}
          onChange={(successCriteria) =>
            onChange({ ...value, successCriteria })
          }
          placeholder="Ce arată că învățarea s-a așezat?"
          readOnly={readOnly}
          multiline
        />
        <Field
          label="Note de observație"
          value={value.observationNotes}
          onChange={(observationNotes) =>
            onChange({ ...value, observationNotes })
          }
          placeholder="Ce vei urmări în timpul lecției…"
          readOnly={readOnly}
          multiline
        />
      </div>
    </EditableCard>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
  multiline?: boolean;
}) {
  const className =
    "mt-1.5 w-full rounded-2xl bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400 disabled:opacity-70";

  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          placeholder={placeholder}
          className={className}
        />
      ) : (
        <input
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
        />
      )}
    </label>
  );
}

export default AssessmentCard;
