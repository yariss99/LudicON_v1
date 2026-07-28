import { PIPELINE_STAGES, PIPELINE_STAGE_LABEL } from "../constants";
import type { PipelineStage } from "../types";

type GenerationPipelineProps = {
  current: PipelineStage | null;
};

function GenerationPipeline({ current }: GenerationPipelineProps) {
  const currentIndex = current ? PIPELINE_STAGES.indexOf(current) : -1;

  return (
    <ol className="flex flex-wrap gap-2" aria-label="Pregătirea materialelor">
      {PIPELINE_STAGES.map((stage, index) => {
        const done = currentIndex > index;
        const active = current === stage;
        return (
          <li
            key={stage}
            className={[
              "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1",
              active
                ? "bg-sky-50 text-sky-800 ring-sky-200"
                : done
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                  : "bg-slate-50 text-slate-400 ring-slate-100",
            ].join(" ")}
          >
            {PIPELINE_STAGE_LABEL[stage]}
          </li>
        );
      })}
    </ol>
  );
}

export default GenerationPipeline;
