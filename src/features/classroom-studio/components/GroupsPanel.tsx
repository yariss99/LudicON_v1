import { useClassroomStudio } from "../hooks/useClassroomStudio";

export function GroupsPanel() {
  const { session, addGroup, updateGroup, deleteGroup } = useClassroomStudio();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Groups</h2>
          <p className="mt-1 text-sm text-slate-500">
            Organize learners now — assign different activities per group in a
            future release.
          </p>
        </div>
        <button
          type="button"
          onClick={addGroup}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add group
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {session.groups.map((group) => (
          <article
            key={group.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ background: group.color }}
              />
              <input
                value={group.name}
                onChange={(e) =>
                  updateGroup(group.id, { name: e.target.value })
                }
                className="min-w-0 flex-1 border-none bg-transparent font-semibold outline-none"
              />
              <button
                type="button"
                className="text-xs text-red-600"
                onClick={() => deleteGroup(group.id)}
              >
                Delete
              </button>
            </div>
            <label className="mt-3 block text-xs font-semibold text-slate-500">
              Members (one per line)
              <textarea
                value={group.memberLabels.join("\n")}
                onChange={(e) =>
                  updateGroup(group.id, {
                    memberLabels: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal"
              />
            </label>
            <textarea
              value={group.notes}
              onChange={(e) =>
                updateGroup(group.id, { notes: e.target.value })
              }
              placeholder="Notes for differentiation…"
              rows={2}
              className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
            />
          </article>
        ))}
      </div>
    </div>
  );
}
