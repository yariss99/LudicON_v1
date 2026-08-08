import { CircleAlert, Info, TriangleAlert } from "lucide-react";
import type { IssueSeverity, ValidationIssue } from "@ludicon/domain";
import { Button, DesignScoreMeter } from "@ludicon/ui";

import { COPY } from "../copy";
import type { BuilderContextValue, BuilderStat } from "../types";
import { balanceScore } from "../validation";

export type GuidancePanelProps<TBody> = {
  builder: BuilderContextValue<TBody>;
  body: TBody;
  stats: readonly BuilderStat[];
};

/**
 * PRIMA's presence in the builder.
 *
 * "Not chat. Not an assistant window. An educational partner." — LESSON-001.
 * At most three recommendations, each with `Aplică` / `Nu acum`. The balance
 * meter carries its own "te ghidează — nu te evaluează" line, so this panel
 * does not repeat it. Nothing here is red: an unfinished section is a normal
 * state of work, so attention is amber and always brings a sentence with it.
 */
export function GuidancePanel<TBody>({
  builder,
  body,
  stats,
}: GuidancePanelProps<TBody>) {
  const { issues, suggestions, sections } = builder;

  const dimensions = sections.map((section) => {
    const complete = section.isComplete(body);
    return {
      id: section.id,
      label: section.label,
      score: complete ? 100 : 35,
      ...(complete ? {} : { note: section.hint }),
    };
  });

  return (
    <div className="flex flex-col gap-6 p-5">
      <DesignScoreMeter
        title={COPY.balance}
        dimensions={dimensions}
        overall={balanceScore(issues)}
      />

      <dl className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <dt className="text-xs text-subtle">{stat.label}</dt>
            <dd className="font-mono text-base text-foreground">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="ghidaj-sugestii">
        <h2 id="ghidaj-sugestii" className="text-sm font-medium text-strong">
          {COPY.guidance}
        </h2>

        {suggestions.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">{COPY.noSuggestions}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="rounded-md bg-surface p-4 ring-1 ring-border"
              >
                <p className="text-sm font-medium text-strong">
                  {suggestion.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {suggestion.detail}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => builder.applySuggestion(suggestion.id)}
                  >
                    {COPY.apply}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => builder.dismissSuggestion(suggestion.id)}
                  >
                    {COPY.notNow}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {issues.length > 0 ? (
        <section aria-labelledby="ghidaj-atentie">
          <h2 id="ghidaj-atentie" className="text-sm font-medium text-strong">
            {COPY.attention}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {issues.map((issue) => (
              <IssueRow
                key={`${issue.code}-${issue.path ?? ""}`}
                issue={issue}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

const TONE: Readonly<Record<IssueSeverity, string>> = {
  blocking: "text-accent",
  error: "text-accent",
  warning: "text-accent",
  info: "text-muted-foreground",
};

function IssueRow({ issue }: { issue: ValidationIssue }) {
  const Icon =
    issue.severity === "info"
      ? Info
      : issue.severity === "warning"
        ? TriangleAlert
        : CircleAlert;

  return (
    <li className="flex gap-2.5 text-sm">
      <Icon
        aria-hidden
        size={18}
        strokeWidth={1.75}
        className={`mt-0.5 shrink-0 ${TONE[issue.severity]}`}
      />
      <div>
        <p className="text-foreground">{issue.message}</p>
        {issue.remedy !== undefined ? (
          <p className="mt-0.5 text-muted-foreground">{issue.remedy}</p>
        ) : null}
      </div>
    </li>
  );
}
