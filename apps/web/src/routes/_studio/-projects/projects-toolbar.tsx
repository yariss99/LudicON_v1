import { Discipline, DISCIPLINE_LABEL } from "@ludicon/domain";
import {
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  cn,
} from "@ludicon/ui";

import {
  SCOPES,
  SCOPE_LABEL,
  SORTS,
  SORT_LABEL,
  type Scope,
  type Sort,
} from "./use-projects-view";

/** Radix cannot carry an empty option value, so "no discipline filter" is named. */
export const ALL_DISCIPLINES = "toate-disciplinele";

/** Radix hands back a bare string; this is the only place it becomes a `Sort`. */
function toSort(value: string): Sort {
  return SORTS.find((option) => option === value) ?? "recente";
}

/**
 * Radix hands back a bare string here too, and this is the only place it becomes
 * a `Discipline`. Parsing rather than casting: the value arrives from a DOM
 * event, and a stale option id in a saved URL is an ordinary thing to meet.
 */
function toDiscipline(value: string): Discipline | undefined {
  return Discipline.safeParse(value).data;
}

export interface ProjectsToolbarProps {
  scope: Scope;
  onScopeChange: (scope: Scope) => void;
  sort: Sort;
  onSortChange: (sort: Sort) => void;
  disciplines: readonly Discipline[];
  discipline: Discipline | undefined;
  onDisciplineChange: (discipline: Discipline | undefined) => void;
  archivedCount: number;
}

/**
 * The three questions a teacher asks a list of evaluations.
 *
 * Which ones are still live, which discipline, and in what order. Scope is a
 * segmented control rather than a third dropdown because it is the one choice
 * whose current value must be readable without opening anything — a teacher who
 * cannot see that they are looking at the archive will conclude their work has
 * been lost.
 *
 * The discipline filter is over the `Discipline` enum, not over free text. It
 * used to read `project.subject`, a `string` the teacher typed, which meant
 * "Matematica" and "Matematică" were two shelves for one subject and neither
 * could be linked to reliably. The ids are ASCII and travel through the URL; the
 * labels with diacritics are the only spelling shown.
 *
 * The archived count sits on its own tab and is real. It is also the only place
 * the archive announces itself, which is why it is a number rather than a dot.
 */
export function ProjectsToolbar({
  scope,
  onScopeChange,
  sort,
  onSortChange,
  disciplines,
  discipline,
  onDisciplineChange,
  archivedCount,
}: ProjectsToolbarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div
        role="group"
        aria-label="Ce proiecte se văd"
        className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
      >
        {SCOPES.map((option) => {
          const active = option === scope;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onScopeChange(option)}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4",
                // Weight is constant across states on purpose. A heavier
                // selected label measures wider, so every segment after it
                // shifted each time the selection moved and the row appeared
                // to shake. The selected state is carried by the pill — a
                // shape that is either drawn or not — plus its ink.
                "text-sm leading-[1.4] font-medium",
                "transition-[background-color,color] duration-[var(--motion-fast)] ease-standard",
                active
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {SCOPE_LABEL[option]}
              {option === "arhivate" && archivedCount > 0 ? (
                <span
                  className={cn(
                    "text-[0.75rem] leading-[1.35] font-medium tabular-nums",
                    "rounded-full px-1.5 py-0.5",
                    // On the selected segment the chip has to clear the tinted
                    // fill it sits on. `bg-muted` measured 1.14:1 there — the
                    // grey blob. Solid primary reads at 4.77:1 dark / 4.75:1
                    // light, with the digit at 7.36:1 / 5.17:1 on top of it.
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {archivedCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {disciplines.length > 1 ? (
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="filtru-disciplina"
              className="text-sm text-foreground"
            >
              Disciplina
            </Label>
            <Select
              value={discipline ?? ALL_DISCIPLINES}
              onValueChange={(value) =>
                onDisciplineChange(
                  value === ALL_DISCIPLINES ? undefined : toDiscipline(value),
                )
              }
            >
              <SelectTrigger
                id="filtru-disciplina"
                className="min-w-48 cursor-pointer"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_DISCIPLINES} className="cursor-pointer">
                  Toate disciplinele
                </SelectItem>
                {disciplines.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="cursor-pointer"
                  >
                    {DISCIPLINE_LABEL[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ordonare" className="text-sm text-foreground">
            Ordonează
          </Label>
          <Select
            value={sort}
            onValueChange={(value) => onSortChange(toSort(value))}
          >
            <SelectTrigger id="ordonare" className="min-w-48 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="cursor-pointer"
                >
                  {SORT_LABEL[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
