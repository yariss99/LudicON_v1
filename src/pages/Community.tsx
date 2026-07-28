import { Link } from "react-router-dom";

/**
 * Community surface — professional shell.
 * Full community features arrive in a later blueprint; navigation stays honest.
 */
function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <main className="flex flex-1 flex-col items-start justify-center px-6 py-16 sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Community
          </p>
          <h1 className="mt-2 max-w-lg text-3xl font-semibold tracking-tight">
            A calm place for professional exchange
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            Share pedagogical patterns with colleagues when you&apos;re ready.
            This space is being prepared — your Teacher Desk remains the home for
            daily work.
          </p>
          <Link
            to="/"
            className="mt-8 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          >
            Back to Teacher Desk
          </Link>
        </main>
      </div>
    </div>
  );
}

export default CommunityPage;
