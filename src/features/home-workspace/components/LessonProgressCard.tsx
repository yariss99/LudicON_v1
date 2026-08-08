import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { presentationStudioRepository } from "../../presentation-studio/services/presentationStudioRepository";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";
import { gameStudioRepository } from "../../game-studio/services/gameStudioRepository";
import { storyStudioRepository } from "../../story-studio/services/storyStudioRepository";
import { openLessonPath } from "../../lesson-studio/LessonStudioPage";
import { wizardPath } from "../../universal-creation-wizard/constants";
import { FLOW_STEPS, FLOW_STEP_META } from "../../teaching-workflow/constants";
import type { HomeLessonProgress } from "../services/homeLessonProgressStore";

type Props = {
  entry: HomeLessonProgress;
};

function Step({
  label,
  done,
  href,
}: {
  label: string;
  done: boolean;
  href?: string;
}) {
  const inner = (
    <>
      <span
        className={[
          "grid h-6 w-6 place-items-center rounded-full text-xs font-bold",
          done ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400",
        ].join(" ")}
        aria-hidden
      >
        {done ? "✔" : "○"}
      </span>
      <span className={done ? "font-medium text-slate-800" : "text-slate-500"}>
        {label}
      </span>
    </>
  );
  if (href && !done) {
    return (
      <li>
        <Link
          to={href}
          className="flex items-center gap-2 text-sm no-underline hover:underline"
        >
          {inner}
        </Link>
      </li>
    );
  }
  return <li className="flex items-center gap-2 text-sm">{inner}</li>;
}

export function LessonProgressCard({ entry }: Props) {
  const flags = {
    lesson: true,
    worksheet:
      worksheetStudioRepository.listByProject(entry.projectId).length > 0,
    presentation:
      presentationStudioRepository.listByProject(entry.projectId).length > 0,
    assessment:
      assessmentStudioRepository.listByProject(entry.projectId).length > 0,
    game: gameStudioRepository.listByProject(entry.projectId).length > 0,
    story: storyStudioRepository.listByProject(entry.projectId).length > 0,
  };

  const href = openLessonPath(entry.projectId, entry.lessonId, "guided", false);
  const nextMissing = FLOW_STEPS.find((k) => !flags[k]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-[0_14px_36px_-24px_rgba(15,23,42,0.4)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Teaching flow
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
            {entry.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {[entry.subject, entry.grade].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Link
          to={href}
          className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white no-underline hover:bg-slate-800"
        >
          Open lesson
        </Link>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {FLOW_STEPS.map((kind) => (
          <Step
            key={kind}
            label={FLOW_STEP_META[kind].label}
            done={flags[kind]}
            href={
              !flags[kind]
                ? wizardPath({
                    type: kind,
                    projectId: entry.projectId,
                    source: kind === "lesson" ? "blank" : "lesson",
                    sourceId: entry.lessonId,
                    title: `${entry.title} — ${FLOW_STEP_META[kind].label}`,
                    subject: entry.subject,
                    grade: entry.grade,
                  })
                : undefined
            }
          />
        ))}
      </ul>

      {nextMissing && nextMissing !== "lesson" ? (
        <p className="mt-4 text-xs text-slate-500">
          What&apos;s next?{" "}
          <Link
            to={wizardPath({
              type: nextMissing,
              projectId: entry.projectId,
              source: "lesson",
              sourceId: entry.lessonId,
              title: `${entry.title} — ${FLOW_STEP_META[nextMissing].label}`,
              subject: entry.subject,
              grade: entry.grade,
            })}
            className="font-semibold text-slate-800 underline-offset-2 hover:underline"
          >
            Create {FLOW_STEP_META[nextMissing].label}
          </Link>
        </p>
      ) : null}
    </motion.article>
  );
}
