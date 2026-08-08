import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  Pencil,
  Trash2,
} from "lucide-react";
import type { LifecycleStatus, PedagogicalBlock } from "@ludicon/domain";
import { Button, Input, Label, StatusBadge, Textarea, cn } from "@ludicon/ui";

/** The states a single block can sit in while the lesson is being designed. */
const BLOCK_STATUSES: readonly LifecycleStatus[] = [
  "draft",
  "needs_review",
  "ready",
];

const STATUS_LABEL: Readonly<Record<string, string>> = {
  draft: "În lucru",
  needs_review: "De revăzut",
  ready: "Gata",
};

const linesToList = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

export interface PedagogicalBlockCardProps {
  block: PedagogicalBlock;
  /** Position within its own section, used to gate the move buttons. */
  index: number;
  total: number;
  onChange: (next: PedagogicalBlock) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

/**
 * One moment of the lesson.
 *
 * Region order follows the Pedagogical Card Model: header, purpose, content,
 * metadata, one local action set, status. Reordering is done with explicit up
 * and down buttons rather than dragging — CH07 requires a keyboard route to
 * every reorder, and buttons are that route rather than a fallback bolted onto
 * one.
 */
export function PedagogicalBlockCard({
  block,
  index,
  total,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: PedagogicalBlockCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);

  const field = (name: string) => `${block.id}-${name}`;
  const patch = (change: Partial<PedagogicalBlock>) =>
    onChange({ ...block, ...change });

  return (
    <article className="rounded-lg bg-card p-6 shadow-soft ring-1 ring-border">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="size-11 shrink-0 px-0"
          aria-expanded={expanded}
          aria-label={expanded ? "Restrânge momentul" : "Extinde momentul"}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? (
            <ChevronDown aria-hidden strokeWidth={1.75} />
          ) : (
            <ChevronRight aria-hidden strokeWidth={1.75} />
          )}
        </Button>

        <div className="min-w-0 flex-1">
          {editingTitle ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field("title")}>Titlul momentului</Label>
              <Input
                id={field("title")}
                autoFocus
                value={block.title}
                onChange={(event) => patch({ title: event.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === "Escape") {
                    event.preventDefault();
                    setEditingTitle(false);
                  }
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className={cn(
                "group flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-sm text-left",
                "font-display text-lg font-semibold text-card-foreground",
              )}
            >
              <span className="min-w-0 truncate">{block.title}</span>
              <Pencil
                aria-hidden
                size={16}
                strokeWidth={1.75}
                className="shrink-0 text-subtle opacity-0 transition-opacity duration-[var(--motion-fast)] group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <span className="sr-only">Schimbă titlul</span>
            </button>
          )}
        </div>

        <StatusBadge
          className="mt-1.5 shrink-0"
          status={block.status}
          label={STATUS_LABEL[block.status]}
        />
      </div>

      {/* Purpose — always visible, even collapsed: it is why the block exists. */}
      <p className="mt-2 pl-14 text-sm text-muted-foreground">
        {block.purpose.trim().length > 0
          ? block.purpose
          : "Încă nu ai spus de ce există acest moment."}
      </p>

      {expanded ? (
        <div className="mt-5 flex flex-col gap-5 pl-14">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field("purpose")}>De ce acest moment</Label>
            <Textarea
              id={field("purpose")}
              rows={2}
              maxLength={140}
              value={block.purpose}
              onChange={(event) => patch({ purpose: event.target.value })}
            />
          </div>

          <div className="grid gap-5 tablet:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field("minutes")}>Timp estimat (minute)</Label>
              <Input
                id={field("minutes")}
                type="number"
                min={0}
                max={600}
                inputMode="numeric"
                value={block.estimatedMinutes ?? ""}
                onChange={(event) =>
                  patch({
                    estimatedMinutes:
                      event.target.value === ""
                        ? null
                        : Number(event.target.value),
                  })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field("status")}>Stadiu</Label>
              <select
                id={field("status")}
                value={block.status}
                onChange={(event) => {
                  const next = BLOCK_STATUSES.find(
                    (candidate) => candidate === event.target.value,
                  );
                  if (next) patch({ status: next });
                }}
                className={cn(
                  "min-h-11 w-full rounded-sm bg-surface px-4 text-base text-foreground",
                  "ring-1 ring-input hover:ring-border-strong",
                )}
              >
                {BLOCK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field("objectives")}>
              Obiective de învățare (câte unul pe rând)
            </Label>
            <Textarea
              id={field("objectives")}
              rows={2}
              value={block.objectives.join("\n")}
              onChange={(event) =>
                patch({ objectives: linesToList(event.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field("competencies")}>
              Competențe (câte una pe rând)
            </Label>
            <Textarea
              id={field("competencies")}
              rows={2}
              value={block.competencies.join("\n")}
              onChange={(event) =>
                patch({ competencies: linesToList(event.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field("strategy")}>Cum se desfășoară</Label>
            <Textarea
              id={field("strategy")}
              rows={3}
              value={block.strategy}
              onChange={(event) => patch({ strategy: event.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field("resources")}>
              Resurse (câte una pe rând)
            </Label>
            <Textarea
              id={field("resources")}
              rows={2}
              value={block.resources.join("\n")}
              onChange={(event) =>
                patch({ resources: linesToList(event.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field("notes")}>Notițele mele</Label>
            <Textarea
              id={field("notes")}
              rows={2}
              value={block.notes}
              onChange={(event) => patch({ notes: event.target.value })}
            />
            <p className="text-[0.8125rem] text-subtle">
              Notițele rămân la tine — nu ajung în materialele elevilor.
            </p>
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-1 border-t border-border pt-4 pl-14">
        <Button
          variant="ghost"
          size="sm"
          disabled={index === 0}
          onClick={() => onMove(-1)}
        >
          <ChevronUp aria-hidden strokeWidth={1.75} />
          Mai sus
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
        >
          <ChevronDown aria-hidden strokeWidth={1.75} />
          Mai jos
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate}>
          <Copy aria-hidden strokeWidth={1.75} />
          Duplică blocul
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 aria-hidden strokeWidth={1.75} />
          Scoate din lecție
        </Button>
      </div>
    </article>
  );
}
