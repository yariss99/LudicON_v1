import { useEffect } from "react";
import type { ProjectId } from "@ludicon/domain";
import { ScrollArea } from "@ludicon/ui";

import { TeacherAssistant } from "../../assistant/TeacherAssistant";
import type { BuilderConfig, BuilderContextValue } from "../types";
import { BuilderHeader } from "./BuilderHeader";
import { SectionNav } from "./SectionNav";
import { SideRail } from "./SideRail";

export type BuilderShellProps<TBody> = {
  config: BuilderConfig<TBody>;
  builder: BuilderContextValue<TBody>;
  projectId: ProjectId;
};

/**
 * The three-column authoring shell.
 *
 * Structure rail · authoring column · PRIMA rail, exactly the layout the design
 * book specifies for the Lesson Design Studio, and identical for all five asset
 * kinds because the difference between them was never the layout.
 *
 * The shell fills the viewport rather than sitting in the Desk's reading column
 * — LESSON-001 is explicit that the studio is not capped the way the Desk is.
 */
export function BuilderShell<TBody>({
  config,
  builder,
  projectId,
}: BuilderShellProps<TBody>) {
  const { EditorPane } = config;

  // Escape closes the side panel. CH07: Escape always exits, no keyboard trap.
  useEffect(() => {
    if (builder.panel === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") builder.setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [builder]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BuilderHeader builder={builder} projectId={projectId} />

      <div className="flex min-h-0 flex-1">
        <div className="hidden w-[var(--navigator-width)] shrink-0 border-r border-border bg-surface py-4 laptop:block">
          <div className="sticky top-4">
            <SectionNav
              sections={builder.sections}
              body={builder.document.body}
              activeId={builder.sectionId}
              onSelect={builder.setSectionId}
            />
          </div>
        </div>

        <ScrollArea className="min-w-0 flex-1 bg-studio-canvas">
          <main className="flex justify-center px-6 py-8">
            <EditorPane
              sectionId={builder.sectionId}
              body={builder.document.body}
              issues={builder.issues}
              onChange={builder.patch}
            />
          </main>
        </ScrollArea>

        <SideRail
          builder={builder}
          stats={config.summarize(builder.document.body)}
        />
      </div>

      <TeacherAssistant projectId={projectId} />
    </div>
  );
}
