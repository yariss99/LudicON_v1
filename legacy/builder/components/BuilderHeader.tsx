import { Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowLeft,
  Copy,
  History,
  ListChecks,
  MoreHorizontal,
  Sparkle,
} from "lucide-react";
import { ASSET_KIND_LABEL, type ProjectId } from "@ludicon/domain";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  StatusBadge,
} from "@ludicon/ui";

import { COPY } from "../copy";
import type { BuilderContextValue } from "../types";
import { SaveIndicator } from "./SaveIndicator";

export type BuilderHeaderProps<TBody> = {
  builder: BuilderContextValue<TBody>;
  projectId: ProjectId;
};

/**
 * The builder header, written once.
 *
 * One filled primary action — `Publică` — and nothing else competes with it
 * (CH02 Law 1). Duplicate and archive live in the overflow menu because they
 * are rare and one of them is destructive-adjacent.
 */
export function BuilderHeader<TBody>({
  builder,
  projectId,
}: BuilderHeaderProps<TBody>) {
  const { document } = builder;

  return (
    <header className="flex flex-col gap-3 border-b border-border bg-surface px-6 py-3">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="shrink-0">
          <Link to="/projects/$projectId" params={{ projectId }}>
            <ArrowLeft aria-hidden size={18} strokeWidth={1.75} />
            {COPY.back}
          </Link>
        </Button>
        <span className="text-sm text-subtle">
          {ASSET_KIND_LABEL[document.kind]}
        </span>
        <StatusBadge status={document.status} />
        <div className="flex-1" />
        <SaveIndicator
          saving={builder.saving}
          dirty={builder.dirty}
          lastSavedAt={builder.lastSavedAt}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label htmlFor="builder-title" className="sr-only">
          {COPY.titleLabel}
        </Label>
        <Input
          id="builder-title"
          value={document.title}
          onChange={(event) => builder.renameTitle(event.target.value)}
          className="h-12 min-w-0 flex-1 border-0 bg-transparent px-0 font-display text-2xl font-semibold shadow-none ring-0 focus-visible:ring-0"
        />

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => builder.setPanel("guidance")}
            aria-pressed={builder.panel === "guidance"}
          >
            <Sparkle aria-hidden size={18} strokeWidth={1.75} />
            {COPY.guidance}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => builder.setPanel("history")}
            aria-pressed={builder.panel === "history"}
          >
            <History aria-hidden size={18} strokeWidth={1.75} />
            {COPY.history}
          </Button>
          <Button variant="secondary" size="sm" onClick={builder.runValidation}>
            <ListChecks aria-hidden size={18} strokeWidth={1.75} />
            {COPY.check}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => void builder.publish()}
          >
            {COPY.publish}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={COPY.more}
                className="w-11 px-0"
              >
                <MoreHorizontal aria-hidden size={18} strokeWidth={1.75} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => void builder.duplicate()}>
                <Copy aria-hidden size={16} strokeWidth={1.75} />
                {COPY.duplicate}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void builder.archive()}>
                <Archive aria-hidden size={16} strokeWidth={1.75} />
                {COPY.archive}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
