import type { ReactNode } from "react";
import type { LessonDraft } from "../../../types/lesson";
import { getLessonStyleLabel } from "../constants";
import SurfaceCard from "../../../components/ui/SurfaceCard";

type LessonSummaryProps = {
  draft: LessonDraft;
};

function SummaryBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <SurfaceCard padding="md" bordered>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h3>
      {children}
    </SurfaceCard>
  );
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">Neselectat</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function LessonSummary({ draft }: LessonSummaryProps) {
  const { general, curriculum, teaching, style } = draft;

  return (
    <div className="space-y-4">
      <SummaryBlock title="Informații generale">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Titlu</dt>
            <dd className="text-sm font-medium text-slate-900">
              {general.title || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Disciplină / Clasă</dt>
            <dd className="text-sm font-medium text-slate-900">
              {general.subject || "—"} · {general.grade || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Durată</dt>
            <dd className="text-sm font-medium text-slate-900">
              {general.duration} minute
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Dată</dt>
            <dd className="text-sm font-medium text-slate-900">
              {general.date || "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-400">Autor</dt>
            <dd className="text-sm font-medium text-slate-900">
              {general.author || "—"}
            </dd>
          </div>
        </dl>
      </SummaryBlock>

      <SummaryBlock title="Curriculum">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-slate-400">Competențe generale</p>
            <TagList items={curriculum.generalCompetencies} />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-400">Competențe specifice</p>
            <TagList items={curriculum.specificCompetencies} />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-400">Obiective</p>
            <TagList items={curriculum.learningObjectives} />
          </div>
        </div>
      </SummaryBlock>

      <SummaryBlock title="Design didactic">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-slate-400">Metode</p>
            <TagList items={teaching.teachingMethods} />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-400">Resurse</p>
            <TagList items={teaching.teachingResources} />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-400">Materiale</p>
            <TagList items={teaching.teachingMaterials} />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-400">Organizare</p>
            <p className="text-sm font-medium text-slate-900">
              {teaching.classroomOrganization || "—"}
            </p>
          </div>
        </div>
      </SummaryBlock>

      <SummaryBlock title="Stil">
        <p className="text-sm font-medium text-slate-900">
          {style ? getLessonStyleLabel(style) : "Neselectat"}
        </p>
      </SummaryBlock>
    </div>
  );
}

export default LessonSummary;
