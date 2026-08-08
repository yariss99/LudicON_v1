import { Check, Circle } from "lucide-react";
import { cn } from "@ludicon/ui";

import { COPY } from "../copy";
import type { BuilderSection } from "../types";

export type SectionNavProps<TBody> = {
  sections: readonly BuilderSection<TBody>[];
  body: TBody;
  activeId: string;
  onSelect: (sectionId: string) => void;
};

/**
 * The structure rail — LESSON-001's `LessonNavigator`, generalised.
 *
 * Flat and hairline-separated rather than a stack of cards: CH02 Law 5 says a
 * card must carry a pedagogical noun, and a navigation entry does not.
 * Completion is shown with an icon and a word as well as a colour, never colour
 * alone (CH07).
 */
export function SectionNav<TBody>({
  sections,
  body,
  activeId,
  onSelect,
}: SectionNavProps<TBody>) {
  return (
    <nav aria-label={COPY.structure} className="flex flex-col">
      <p className="px-4 pb-2 text-xs font-medium tracking-wide text-subtle">
        {COPY.structure}
      </p>
      <ul className="flex flex-col">
        {sections.map((section) => {
          const complete = section.isComplete(body);
          const active = section.id === activeId;
          const Icon = section.icon;

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex min-h-11 w-full cursor-pointer items-center gap-3 border-l-2 px-4 py-2 text-left text-sm",
                  "transition-colors duration-[--motion-fast]",
                  active
                    ? "border-l-primary bg-primary-soft font-medium text-primary"
                    : "border-l-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  aria-hidden
                  size={18}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
                <span className="flex-1 truncate">{section.label}</span>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 text-xs",
                    complete ? "text-secondary" : "text-subtle",
                  )}
                >
                  {complete ? (
                    <Check aria-hidden size={14} strokeWidth={2} />
                  ) : (
                    <Circle aria-hidden size={10} strokeWidth={2} />
                  )}
                  <span className="sr-only">
                    {complete ? COPY.sectionComplete : COPY.sectionIncomplete}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
