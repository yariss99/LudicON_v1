import {
  CircleAlert,
  CircleCheck,
  Eye,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { IssueSeverity, ValidationIssue } from "@ludicon/domain";

import { CHECK_COPY } from "./copy";
import type { Checklist } from "./checklist";

/**
 * The checklist, read out loud before anything reaches paper.
 *
 * Every row says its severity THREE times: in a word, in a glyph, and in a
 * colour. That is not belt and braces, it is the product's rule — colour is
 * never allowed to be the only carrier of meaning — and it is load-bearing
 * here, because two of the four levels share a colour. "De rezolvat" and "De
 * verificat" are told apart by their words and their icons; the colour only
 * groups them.
 *
 * The rejected alternative was a coloured dot per row with the severity in a
 * tooltip. It is tidier, it is what the first sketch had, and it fails for
 * anyone who cannot distinguish the dots or cannot hover to find out.
 *
 * Font weight does not change between levels. A blocking row is not bolder than
 * an informational one: weight is the strongest emphasis on a screen and using
 * it for severity makes the four levels read as four different kinds of text.
 * Only the icon and the label change.
 *
 * This component decides nothing. It is handed a `Checklist` and renders it;
 * whether the paper may be printed is `blocksPrinting`'s answer, taken in
 * `checklist.ts`, so the screen and the server cannot disagree.
 */

const SEVERITY_ICON: Readonly<Record<IssueSeverity, LucideIcon>> =
  Object.freeze({
    blocking: CircleAlert,
    error: TriangleAlert,
    warning: Eye,
    info: Info,
  });

/**
 * Three colours for four levels, on purpose.
 *
 * The teacher's question is "what stops me printing" — one thing does, one
 * thing needs a second look, and the rest are notes. Four hues would be four
 * things to learn; three plus four words and four glyphs is the same
 * information with less to decode.
 */
const SEVERITY_TONE: Readonly<Record<IssueSeverity, string>> = Object.freeze({
  blocking: "text-destructive",
  error: "text-warning",
  warning: "text-muted-foreground",
  info: "text-muted-foreground",
});

export interface ChecklistViewProps {
  checklist: Checklist;
  /** True until the sheets have been laid out and measured at least once. */
  pending: boolean;
}

export function ChecklistView({ checklist, pending }: ChecklistViewProps) {
  if (pending) {
    return (
      <p className="py-3 text-base text-muted-foreground">
        {CHECK_COPY.checking}
      </p>
    );
  }

  if (checklist.issues.length === 0) {
    return (
      <p className="flex items-center gap-2 py-3 text-base text-foreground">
        <CircleCheck
          aria-hidden
          strokeWidth={1.75}
          className="size-5 shrink-0 text-success"
        />
        {CHECK_COPY.allClear}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {checklist.issues.map((issue, index) => (
        <IssueRow key={`${issue.code}-${issue.path ?? index}`} issue={issue} />
      ))}
    </ul>
  );
}

function IssueRow({ issue }: { issue: ValidationIssue }) {
  const Icon = SEVERITY_ICON[issue.severity];

  return (
    <li className="flex gap-3 rounded-sm py-2">
      <Icon
        aria-hidden
        strokeWidth={1.75}
        className={`mt-0.5 size-5 shrink-0 ${SEVERITY_TONE[issue.severity]}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-base leading-[1.5] text-foreground">
          <span className={SEVERITY_TONE[issue.severity]}>
            {CHECK_COPY.severity[issue.severity]}
          </span>
          {" · "}
          {issue.message}
        </p>
        {issue.remedy ? (
          <p className="mt-0.5 text-sm leading-[1.5] text-muted-foreground">
            {issue.remedy}
          </p>
        ) : null}
      </div>
    </li>
  );
}
