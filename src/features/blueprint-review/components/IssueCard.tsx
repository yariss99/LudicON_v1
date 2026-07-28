import type { ValidationIssue } from "../types";

type IssueCardProps = {
  issue: ValidationIssue;
};

function IssueCard({ issue }: IssueCardProps) {
  const tone =
    issue.severity === "blocking"
      ? "bg-amber-50 text-amber-950 ring-amber-100"
      : issue.severity === "warning"
        ? "bg-sky-50 text-sky-950 ring-sky-100"
        : "bg-slate-50 text-slate-700 ring-slate-100";

  return (
    <li className={`rounded-2xl px-3 py-2.5 text-xs ring-1 ${tone}`}>
      <p className="font-semibold">{issue.title}</p>
      <p className="mt-1 leading-relaxed opacity-90">{issue.explanation}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide opacity-60">
        {issue.sectionId.replace(/_/g, " ")} · {issue.severity}
      </p>
    </li>
  );
}

export default IssueCard;
