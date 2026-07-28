import { Link } from "react-router-dom";
import { classroomService } from "../services/classroomService";
import { pedagogicalDnaService } from "../services/pedagogicalDnaService";

/**
 * Analytics — teacher practice patterns only.
 * Never profiles students. Uses Classroom Intelligence + Pedagogical DNA.
 */
function AnalyticsPage() {
  const insights = classroomService.getInsights().slice(0, 4);
  const dna = pedagogicalDnaService.getProfile();

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900">
      <div className="mx-auto w-full max-w-[1600px] px-6 py-10 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Analytics
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Practice patterns
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Insights from your teaching history — never student profiles, never
          rankings.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
            <h2 className="text-sm font-semibold text-slate-900">
              Pedagogical DNA
            </h2>
            <p className="mt-2 text-sm text-slate-500">{dna.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {dna.signatureStyles.map((style) => (
                <span
                  key={style}
                  className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                >
                  {style}
                </span>
              ))}
            </div>
            <Link
              to="/dna"
              className="mt-5 inline-block text-sm font-medium text-slate-700 no-underline hover:text-slate-900"
            >
              Open full DNA →
            </Link>
          </section>

          <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
            <h2 className="text-sm font-semibold text-slate-900">
              Class insights
            </h2>
            {insights.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                Reflections will gather here as you teach.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {insights.map((insight) => (
                  <li key={insight.id}>
                    <p className="text-sm font-medium text-slate-800">
                      {insight.title}
                    </p>
                    <p className="text-xs text-slate-500">{insight.detail}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/classroom"
              className="mt-5 inline-block text-sm font-medium text-slate-700 no-underline hover:text-slate-900"
            >
              Open Classroom Intelligence →
            </Link>
          </section>
        </div>

        <Link
          to="/"
          className="mt-10 inline-flex rounded-full px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 no-underline hover:bg-white"
        >
          Back to Teacher Desk
        </Link>
      </div>
    </div>
  );
}

export default AnalyticsPage;
