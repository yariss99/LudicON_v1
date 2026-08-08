import {
  Circle,
  CircleCheck,
  CircleDot,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import {
  LESSON_SECTION_LABEL,
  LESSON_SECTION_ORDER,
  type CompletionState,
  type LessonPlan,
  type LessonSectionId,
} from "@ludicon/domain";
import { Button, cn } from "@ludicon/ui";

import {
  COMPLETION_LABEL,
  sectionCompletion,
  sectionsStillNeeded,
} from "./lesson-analysis";

/**
 * Shape carries the state, colour only reinforces it.
 *
 * An open circle, a half-filled one and a check read differently in greyscale,
 * which is what CH07's ban on colour-only meaning actually asks for.
 */
const COMPLETION_ICON: Readonly<Record<CompletionState, LucideIcon>> =
  Object.freeze({
    empty: Circle,
    partial: CircleDot,
    complete: CircleCheck,
  });

const COMPLETION_TONE: Readonly<Record<CompletionState, string>> =
  Object.freeze({
    empty: "text-subtle",
    partial: "text-accent",
    complete: "text-secondary",
  });

export interface LessonNavigatorProps {
  plan: LessonPlan;
  activeSection: LessonSectionId;
  onSelect: (section: LessonSectionId) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

/**
 * The lesson's structure, always in view.
 *
 * Flat and hairline-separated rather than a stack of cards: CH02 Law 5 says a
 * card must stand for a pedagogical idea, and a navigation row is a pointer,
 * not an idea. Collapsing keeps the icon rail so the teacher never loses the
 * sense of where they are in the nine sections.
 */
export function LessonNavigator({
  plan,
  activeSection,
  onSelect,
  collapsed,
  onToggleCollapsed,
}: LessonNavigatorProps) {
  const stillNeeded = new Set(sectionsStillNeeded(plan));

  return (
    <nav
      aria-label="Structura lecției"
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-surface",
        // Width is NOT transitioned, for the same reason the shell rail's is
        // not: animating it reflows the canvas beside it for the whole
        // duration, and a pointer aimed at a block during that window lands on
        // stale geometry. It reaches its final width on the frame the
        // preference changes.
        "transition-[background-color,border-color] duration-[var(--motion-fast)] ease-standard",
        collapsed ? "w-12" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2 border-b border-border",
          collapsed ? "justify-center px-1" : "px-4",
        )}
      >
        {collapsed ? null : (
          <h2 className="flex-1 text-sm font-medium tracking-wide text-muted-foreground">
            Structură
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="size-11 px-0"
          aria-expanded={!collapsed}
          aria-label={
            collapsed
              ? "Arată structura lecției"
              : "Restrânge structura lecției"
          }
          onClick={onToggleCollapsed}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden strokeWidth={1.75} />
          ) : (
            <PanelLeftClose aria-hidden strokeWidth={1.75} />
          )}
        </Button>
      </div>

      <ul className="flex-1 overflow-y-auto py-2">
        {LESSON_SECTION_ORDER.map((section) => {
          const completion = sectionCompletion(plan, section);
          const Icon = COMPLETION_ICON[completion];
          const label = LESSON_SECTION_LABEL[section];
          const active = section === activeSection;
          const needed = stillNeeded.has(section);

          return (
            <li key={section}>
              <button
                type="button"
                onClick={() => onSelect(section)}
                aria-current={active ? "true" : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex w-full min-h-11 cursor-pointer items-center gap-3 text-left",
                  "transition-colors duration-[var(--motion-fast)] ease-standard",
                  collapsed ? "justify-center px-0" : "px-4",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <Icon
                  aria-hidden
                  size={20}
                  strokeWidth={1.75}
                  className={cn("shrink-0", COMPLETION_TONE[completion])}
                />

                {collapsed ? (
                  <span className="sr-only">
                    {label} — {COMPLETION_LABEL[completion]}
                  </span>
                ) : (
                  <span className="flex min-w-0 flex-1 flex-col py-2">
                    <span className="truncate text-sm leading-snug">
                      {label}
                    </span>
                    <span className="truncate text-[0.75rem] text-muted-foreground">
                      {COMPLETION_LABEL[completion]}
                      {needed ? " · de completat" : ""}
                    </span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
