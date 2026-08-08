import type { QuickProjectErrors, QuickProjectInput } from "../types";
import {
  PROJECT_GRADES,
  PROJECT_SCHOOL_YEARS,
  PROJECT_SUBJECTS,
} from "../../projects/constants";

type CreateProjectFormProps = {
  value: QuickProjectInput;
  errors: QuickProjectErrors;
  submitted: boolean;
  busy: boolean;
  onChange: (patch: Partial<QuickProjectInput>) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function CreateProjectForm({
  value,
  errors,
  submitted,
  busy,
  onChange,
  onSubmit,
  onCancel,
}: CreateProjectFormProps) {
  return (
    <form
      className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(15,23,42,0.2)]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <header className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          New Project
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
          Create a project in under a minute. Everything you build — lessons,
          worksheets, assessments, and more — will live here.
        </p>
      </header>

      <label className="mb-5 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
        Project title
        <input
          autoFocus
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Fractions — Unit 1"
          className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
        />
        {submitted && errors.title ? (
          <span className="font-medium text-red-600">{errors.title}</span>
        ) : null}
      </label>

      <label className="mb-5 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
        Subject
        <select
          value={value.subject}
          onChange={(e) => onChange({ subject: e.target.value })}
          className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
        >
          <option value="">Select subject</option>
          {PROJECT_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        {submitted && errors.subject ? (
          <span className="font-medium text-red-600">{errors.subject}</span>
        ) : null}
      </label>

      <label className="mb-5 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
        Grade
        <select
          value={value.grade}
          onChange={(e) => onChange({ grade: e.target.value })}
          className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
        >
          <option value="">Select grade</option>
          {PROJECT_GRADES.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
        {submitted && errors.grade ? (
          <span className="font-medium text-red-600">{errors.grade}</span>
        ) : null}
      </label>

      <label className="mb-7 flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
        School year
        <select
          value={value.schoolYear}
          onChange={(e) => onChange({ schoolYear: e.target.value })}
          className="h-11 rounded-xl border border-slate-200 px-3.5 text-sm font-normal text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5"
        >
          {PROJECT_SCHOOL_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {submitted && errors.schoolYear ? (
          <span className="font-medium text-red-600">{errors.schoolYear}</span>
        ) : null}
      </label>

      <div className="flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? "Creating…" : "Create project"}
        </button>
      </div>
    </form>
  );
}
