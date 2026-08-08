import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCopilot, SuggestionCard } from "../../../modules/copilot";
import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";

type Props = {
  projectId: string | null;
};

function lessonsCreatedToday(projectId: string | null): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startMs = start.getTime();
  const lessons = projectId
    ? lessonStudioRepository.listByProject(projectId)
    : lessonStudioRepository.list();
  return lessons.filter((l) => Date.parse(l.createdAt) >= startMs).length;
}

export function CopilotSection({ projectId }: Props) {
  const { suggestions, dismiss, openPanel, hasSuggestions } = useCopilot();
  const todayCount = lessonsCreatedToday(projectId);

  const showEmptyLessonHint = todayCount === 0;

  return (
    <section aria-labelledby="home-copilot">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Contextual assistant
          </p>
          <h2
            id="home-copilot"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            P.R.R.I.M.A. Copilot
          </h2>
        </div>
        <button
          type="button"
          onClick={openPanel}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Open panel
        </button>
      </div>

      <div className="space-y-2.5">
        {showEmptyLessonHint ? (
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              Create your first lesson
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              You haven&apos;t created any lessons today. Start with a lesson —
              then build worksheet, presentation, and assessment around it.
            </p>
            <p className="mt-3 text-xs font-medium text-slate-400">
              Use <span className="text-slate-700">New Lesson</span> above to
              begin.
            </p>
          </motion.article>
        ) : null}

        {hasSuggestions
          ? suggestions.slice(0, 4).map((s, index) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onDismiss={dismiss}
                index={index}
              />
            ))
          : !showEmptyLessonHint ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                No suggestions right now — keep creating.
              </div>
            ) : null}

        {projectId && hasSuggestions ? (
          <p className="pt-1 text-center text-xs text-slate-400">
            Or continue in{" "}
            <Link
              to={`/studio/${projectId}/overview`}
              className="font-medium text-slate-600 underline-offset-2 hover:underline"
            >
              your project workspace
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
