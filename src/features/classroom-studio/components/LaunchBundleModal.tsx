import { useMemo, useState } from "react";
import { useClassroomStudio } from "../hooks/useClassroomStudio";

type Props = {
  onClose: () => void;
};

export function LaunchBundleModal({ onClose }: Props) {
  const { resources, launchBundle, session } = useClassroomStudio();
  const [lessonId, setLessonId] = useState(session.lessonId ?? "");
  const [presentationId, setPresentationId] = useState(
    session.presentationId ?? "",
  );
  const [worksheetId, setWorksheetId] = useState(session.worksheetId ?? "");
  const [gameId, setGameId] = useState(session.gameId ?? "");
  const [assessmentId, setAssessmentId] = useState(session.assessmentId ?? "");

  const canLaunch = useMemo(
    () =>
      Boolean(
        lessonId || presentationId || worksheetId || gameId || assessmentId,
      ),
    [lessonId, presentationId, worksheetId, gameId, assessmentId],
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold tracking-tight">
          Launch lesson bundle
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Connect a lesson with presentation, worksheet, game, and assessment —
          Classroom Studio builds the teaching timeline.
        </p>

        <div className="mt-5 space-y-3">
          {(
            [
              ["Lesson", lessonId, setLessonId, resources.lessons],
              [
                "Presentation",
                presentationId,
                setPresentationId,
                resources.presentations,
              ],
              ["Worksheet", worksheetId, setWorksheetId, resources.worksheets],
              ["Game", gameId, setGameId, resources.games],
              [
                "Assessment",
                assessmentId,
                setAssessmentId,
                resources.assessments,
              ],
            ] as const
          ).map(([label, value, setValue, options]) => (
            <label
              key={label}
              className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500"
            >
              {label}
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-normal"
              >
                <option value="">None</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canLaunch}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            onClick={() => {
              launchBundle({
                lessonId: lessonId || undefined,
                presentationId: presentationId || undefined,
                worksheetId: worksheetId || undefined,
                gameId: gameId || undefined,
                assessmentId: assessmentId || undefined,
              });
              onClose();
            }}
          >
            Build timeline
          </button>
        </div>
      </div>
    </div>
  );
}
