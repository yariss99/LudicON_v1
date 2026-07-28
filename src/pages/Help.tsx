import { Link } from "react-router-dom";

function Help() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Help
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          How PRIMA supports you
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Start from the Teacher Desk. Create from intention. Continue from
          Today&apos;s Focus. When you need deeper tools, Timeline, Workspace,
          and Classroom Intelligence are one click away.
        </p>

        <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900">Quick paths</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link to="/" className="font-medium text-slate-800 no-underline hover:underline">
                Teacher Desk
              </Link>{" "}
              — today&apos;s work and next step
            </li>
            <li>
              <Link to="/studio" className="font-medium text-slate-800 no-underline hover:underline">
                Create
              </Link>{" "}
              — start a new learning experience
            </li>
            <li>
              <Link to="/timeline" className="font-medium text-slate-800 no-underline hover:underline">
                Timeline
              </Link>{" "}
              — navigate by week
            </li>
          </ul>
        </section>

        <section
          id="feedback"
          className="mt-6 scroll-mt-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200/70"
        >
          <h2 className="text-sm font-semibold text-slate-900">Feedback</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Tell us what would make your teaching week calmer. Email{" "}
            <a
              href="mailto:feedback@prima.education?subject=PRIMA%20teacher%20feedback"
              className="font-medium text-slate-800 underline-offset-2 hover:underline"
            >
              feedback@prima.education
            </a>
            .
          </p>
        </section>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-slate-800"
        >
          Back to Teacher Desk
        </Link>
      </div>
    </div>
  );
}

export default Help;
