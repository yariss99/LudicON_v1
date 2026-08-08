import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";
import type { Project, ProjectId } from "@ludicon/domain";
import {
  Button,
  PrimaMark,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@ludicon/ui";

import { repositories } from "../../lib/data";
import { listDocumentsForProject } from "../../lib/documents";
import { useWorkspaceActions } from "../workspace/useWorkspace";
import { ASSISTANT_COPY } from "./copy";
import { buildSuggestions, topSuggestions } from "./suggestions";

export type TeacherAssistantProps = {
  /** Scopes the guidance. Without one, PRIMA says so rather than guessing. */
  projectId?: ProjectId;
};

/**
 * PRIMA, as a side panel.
 *
 * "Not chat. Not an assistant window. An educational partner." At most three
 * observations, each with `Aplică` and `Nu acum`, and no text box: the old
 * assistant's composer fed a substring matcher that answered from a table of 23
 * templates, which is theatre rather than help.
 *
 * Mounted per surface rather than in the studio layout, so the shell stays
 * owned by one place; hoisting it later is a single import.
 */
export function TeacherAssistant({ projectId }: TeacherAssistantProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="fixed right-6 bottom-6 z-40 shadow-soft"
        >
          <PrimaMark size={20} />
          {ASSISTANT_COPY.trigger}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-[26rem]">
        <SheetHeader>
          <SheetTitle>{ASSISTANT_COPY.title}</SheetTitle>
          <SheetDescription>{ASSISTANT_COPY.intro}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <AssistantBody
            projectId={projectId}
            onNavigate={() => setOpen(false)}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function AssistantBody({
  projectId,
  onNavigate,
}: {
  projectId: ProjectId | undefined;
  onNavigate: () => void;
}) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<readonly string[]>([]);

  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? "none"),
    queryFn: (): Promise<Project | null> =>
      projectId === undefined
        ? Promise.resolve(null)
        : repositories.projects.get(projectId),
  });

  const documents = useQuery({
    queryKey: queryKeys.documents.list(projectId ?? "none"),
    queryFn: () =>
      projectId === undefined
        ? Promise.resolve([])
        : listDocumentsForProject(projectId),
  });

  const actions = useWorkspaceActions(project.data ?? null);

  const suggestions = topSuggestions(
    buildSuggestions({
      project: project.data ?? null,
      documents: documents.data ?? [],
    }),
    dismissed,
  );

  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      {suggestions.map((suggestion) => (
        <article
          key={suggestion.id}
          className="rounded-md bg-surface p-4 ring-1 ring-border"
        >
          <h3 className="text-base font-medium text-strong">
            {suggestion.title}
          </h3>
          <p className="mt-1 text-sm leading-[1.55] text-muted-foreground">
            {suggestion.detail}
          </p>

          <div className="mt-3 flex items-center gap-2">
            {suggestion.action !== undefined && projectId !== undefined ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const kind = suggestion.action?.kind;
                  if (kind === undefined) return;
                  void actions.addMaterial(kind).then((documentId) => {
                    if (documentId === null) return;
                    onNavigate();
                    void navigate({
                      to: "/builder/$projectId/$kind/$documentId",
                      params: { projectId, kind, documentId },
                    });
                  });
                }}
              >
                {ASSISTANT_COPY.apply}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setDismissed((current) => [...current, suggestion.id])
              }
            >
              {ASSISTANT_COPY.notNow}
            </Button>
          </div>
        </article>
      ))}

      <p className="mt-2 text-sm leading-[1.55] text-subtle">
        {ASSISTANT_COPY.footer}
      </p>
    </div>
  );
}
