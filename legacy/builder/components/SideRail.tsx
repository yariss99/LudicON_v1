import { X } from "lucide-react";
import { Button, ScrollArea } from "@ludicon/ui";

import { COPY } from "../copy";
import type { BuilderContextValue, BuilderStat } from "../types";
import { GuidancePanel } from "./GuidancePanel";
import { HistoryPanel } from "./HistoryPanel";

export type SideRailProps<TBody> = {
  builder: BuilderContextValue<TBody>;
  stats: readonly BuilderStat[];
};

/**
 * The right-hand rail — LESSON-001's `PrimaIntelligencePanel`.
 *
 * Never wider than the primary column, one panel at a time, and dismissible
 * with Escape via the close button's own focus order. The five builders each
 * shipped a 5-to-8-tab rail; two panels is what actually earns the width.
 */
export function SideRail<TBody>({ builder, stats }: SideRailProps<TBody>) {
  if (builder.panel === null) return null;

  return (
    <aside
      aria-label="PRIMA"
      className="hidden w-[var(--panel-width)] shrink-0 border-l border-border bg-panel desktop:block"
    >
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-sm font-medium text-strong">
            {builder.panel === "guidance" ? COPY.guidance : COPY.history}
          </p>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Închide panoul"
            className="w-11 px-0"
            onClick={() => builder.setPanel(null)}
          >
            <X aria-hidden size={18} strokeWidth={1.75} />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {builder.panel === "guidance" ? (
            <GuidancePanel
              builder={builder}
              body={builder.document.body}
              stats={stats}
            />
          ) : (
            <HistoryPanel
              versions={builder.versions}
              onRestore={(versionId) => void builder.restoreVersion(versionId)}
            />
          )}
        </ScrollArea>
      </div>
    </aside>
  );
}
