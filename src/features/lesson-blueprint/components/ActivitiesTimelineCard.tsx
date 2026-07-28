import {
  ArrowDown,
  ArrowUp,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import type { LessonStudioActivity } from "../../blueprint-review/types";
import { DEFAULT_ACTIVITY_TITLES, EMPTY_SECTION_HINT } from "../constants";
import EditableCard from "./EditableCard";

type ActivitiesTimelineCardProps = {
  collapsed: boolean;
  onToggle: () => void;
  activities: LessonStudioActivity[];
  onChange: (activities: LessonStudioActivity[]) => void;
  readOnly?: boolean;
};

function uid(): string {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function ActivitiesTimelineCard({
  collapsed,
  onToggle,
  activities,
  onChange,
  readOnly,
}: ActivitiesTimelineCardProps) {
  const updateAt = (index: number, patch: Partial<LessonStudioActivity>) => {
    onChange(
      activities.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= activities.length) return;
    const next = [...activities];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(target, 0, moved);
    onChange(next);
  };

  const duplicate = (index: number) => {
    const source = activities[index];
    if (!source) return;
    const next = [...activities];
    next.splice(index + 1, 0, {
      ...structuredClone(source),
      id: uid(),
      title: `${source.title} (copie)`.trim(),
    });
    onChange(next);
  };

  const remove = (index: number) =>
    onChange(activities.filter((_, i) => i !== index));

  const add = () => {
    const title =
      DEFAULT_ACTIVITY_TITLES[
        Math.min(activities.length, DEFAULT_ACTIVITY_TITLES.length - 1)
      ] ?? "Activitate";
    onChange([
      ...activities,
      {
        id: uid(),
        title,
        description: "",
        durationMinutes: undefined,
        resources: "",
        teacherNotes: "",
      },
    ]);
  };

  return (
    <EditableCard
      id="lesson-card-activities"
      title="Desfășurarea lecției"
      collapsed={collapsed}
      onToggle={onToggle}
      readOnly={readOnly}
      hint={
        activities.length === 0
          ? EMPTY_SECTION_HINT
          : "Mută, duplică sau adaugă etape pe parcursul lecției."
      }
      showAddInfo={activities.length === 0 && !readOnly}
      onAddInfo={add}
    >
      {activities.length > 0 ? (
        <ol className="relative space-y-0 border-l-2 border-slate-200 pl-5">
          {activities.map((activity, index) => (
            <li key={activity.id} className="relative pb-6 last:pb-0">
              <span
                className="absolute -left-[1.55rem] top-3 h-3 w-3 rounded-full bg-slate-900 ring-4 ring-white"
                aria-hidden
              />
              {index < activities.length - 1 ? (
                <span
                  className="absolute -left-[1.2rem] top-7 text-[10px] text-slate-300"
                  aria-hidden
                >
                  ↓
                </span>
              ) : null}

              <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <input
                    value={activity.title}
                    disabled={readOnly}
                    list="lesson-activity-titles"
                    onChange={(e) => updateAt(index, { title: e.target.value })}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 outline-none disabled:opacity-70"
                  />
                  <div className="ml-auto flex gap-1">
                    {!readOnly ? (
                      <>
                        <button
                          type="button"
                          onClick={() => move(index, -1)}
                          disabled={index === 0}
                          className="rounded-full p-1.5 text-slate-400 hover:bg-white disabled:opacity-30"
                          aria-label="Mută în sus"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => move(index, 1)}
                          disabled={index === activities.length - 1}
                          className="rounded-full p-1.5 text-slate-400 hover:bg-white disabled:opacity-30"
                          aria-label="Mută în jos"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicate(index)}
                          className="rounded-full p-1.5 text-slate-400 hover:bg-white"
                          aria-label="Duplică"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="rounded-full p-1.5 text-slate-400 hover:bg-white"
                          aria-label="Șterge"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                <label className="mb-3 block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Descriere
                  </span>
                  <textarea
                    value={activity.description}
                    disabled={readOnly}
                    onChange={(e) =>
                      updateAt(index, { description: e.target.value })
                    }
                    rows={2}
                    placeholder="Ce fac elevii în această etapă?"
                    className="mt-1 w-full resize-y rounded-xl bg-white px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 outline-none placeholder:text-slate-400 disabled:opacity-70"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Durata
                    </span>
                    <input
                      type="number"
                      min={1}
                      disabled={readOnly}
                      value={activity.durationMinutes ?? ""}
                      onChange={(e) => {
                        const n = Number.parseInt(e.target.value, 10);
                        updateAt(index, {
                          durationMinutes:
                            Number.isFinite(n) && n > 0 ? n : undefined,
                        });
                      }}
                      placeholder="min"
                      className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 outline-none disabled:opacity-70"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Resurse
                    </span>
                    <input
                      value={activity.resources ?? ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        updateAt(index, { resources: e.target.value })
                      }
                      placeholder="Materiale pentru această etapă…"
                      className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 outline-none disabled:opacity-70"
                    />
                  </label>
                </div>

                <label className="mt-3 block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Note pentru profesor
                  </span>
                  <textarea
                    value={activity.teacherNotes ?? ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      updateAt(index, { teacherNotes: e.target.value })
                    }
                    rows={2}
                    placeholder="Observații, semnale, adaptări…"
                    className="mt-1 w-full resize-y rounded-xl bg-white px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 outline-none placeholder:text-slate-400 disabled:opacity-70"
                  />
                </label>
              </div>
            </li>
          ))}
          {!readOnly ? (
            <li className="pt-2">
              <button
                type="button"
                onClick={add}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
              >
                <Plus size={14} aria-hidden />
                Adaugă activitate
              </button>
            </li>
          ) : null}
        </ol>
      ) : null}
      <datalist id="lesson-activity-titles">
        {DEFAULT_ACTIVITY_TITLES.map((title) => (
          <option key={title} value={title} />
        ))}
      </datalist>
    </EditableCard>
  );
}

export default ActivitiesTimelineCard;
