import { Link } from "react-router-dom";

type WorkspaceBreadcrumbProps = {
  projectTitle: string;
};

export function WorkspaceBreadcrumb({ projectTitle }: WorkspaceBreadcrumbProps) {
  return (
    <nav
      className="mb-4 flex flex-wrap items-center gap-2 text-sm text-slate-500"
      aria-label="Breadcrumb"
    >
      <Link to="/" className="no-underline hover:text-slate-900">
        Home
      </Link>
      <span aria-hidden>/</span>
      <Link to="/projects" className="no-underline hover:text-slate-900">
        Projects
      </Link>
      <span aria-hidden>/</span>
      <span className="max-w-[16rem] truncate font-medium text-slate-900 sm:max-w-md">
        {projectTitle}
      </span>
    </nav>
  );
}
