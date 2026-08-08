import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { COLLECTIONS, queryKeys } from "@ludicon/data-access";
import {
  AnyDocument,
  AnyVersion,
  nowTimestamp,
  type DocumentId,
  type Project,
  type ProjectId,
  type ProjectPatch,
} from "@ludicon/domain";
import { toast } from "@ludicon/ui";

import { dataProvider, repositories } from "../../lib/data";
import {
  buildVersion,
  listDocumentsForProject,
  listVersionsForProject,
  newDocumentId,
} from "../../lib/documents";
import { BUILDERS } from "../builder/registry";
import type { BuilderKind } from "../builder/types";
import { WORKSPACE_COPY } from "./copy";

export type WorkspaceData = {
  project: Project;
  documents: readonly AnyDocument[];
  versions: readonly AnyVersion[];
};

export type WorkspaceState =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "missing" }
  | { status: "ready"; data: WorkspaceData };

/**
 * Everything the workspace reads, in one place.
 *
 * The old `useProjectWorkspace` invalidated its caches with a hand-rolled
 * `tick` counter and eslint-disabled dependency arrays. TanStack Query's key
 * hierarchy does that job here, so the mutations below only have to say which
 * prefix changed.
 */
export function useWorkspace(projectId: ProjectId): WorkspaceState {
  const project = useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => repositories.projects.get(projectId),
  });

  const documents = useQuery({
    queryKey: queryKeys.documents.list(projectId),
    queryFn: () => listDocumentsForProject(projectId),
  });

  const versions = useQuery({
    queryKey: queryKeys.documents.versions(projectId),
    queryFn: () => listVersionsForProject(projectId),
  });

  if (project.isPending) return { status: "loading" };
  if (project.isError) return { status: "failed" };
  if (project.data === null) return { status: "missing" };

  return {
    status: "ready",
    data: {
      project: project.data,
      documents: documents.data ?? [],
      versions: versions.data ?? [],
    },
  };
}

/**
 * What can be done to a material without knowing anything about its project.
 *
 * Kept apart so the materials panel can own its own actions instead of waiting
 * for them to be threaded down through props it does not otherwise need.
 */
export type MaterialActions = {
  duplicateMaterial: (document: AnyDocument) => Promise<DocumentId | null>;
  removeMaterial: (document: AnyDocument) => Promise<void>;
  write: (document: AnyDocument, note: string) => Promise<DocumentId | null>;
};

export function useMaterialActions(): MaterialActions {
  const queryClient = useQueryClient();

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.documents.all(),
    });
    await queryClient.invalidateQueries({
      queryKey: queryKeys.resources.all(),
    });
  }, [queryClient]);

  /**
   * Writes a new material and its first snapshot together.
   *
   * The snapshot is not an extra: a document saved without one starts its life
   * with an empty history, so the teacher's very first edit looks like the
   * beginning of the material rather than a change to it.
   */
  const write = useCallback(
    async (document: AnyDocument, note: string): Promise<DocumentId | null> => {
      try {
        await dataProvider.transact(async (tx) => {
          const saved = await tx.put(
            COLLECTIONS.documents,
            document.id,
            document,
            AnyDocument,
          );
          const snapshot = buildVersion(saved, note);
          await tx.put(
            COLLECTIONS.documentVersions,
            snapshot.id,
            snapshot,
            AnyVersion,
          );
        });
        await refresh();
        return document.id;
      } catch {
        toast.error(WORKSPACE_COPY.saveFailed);
        return null;
      }
    },
    [refresh],
  );

  const duplicateMaterial = useCallback(
    (document: AnyDocument): Promise<DocumentId | null> => {
      const now = nowTimestamp();
      return write(
        {
          ...document,
          id: newDocumentId(),
          title: `${document.title} ${WORKSPACE_COPY.copySuffix}`,
          status: "draft",
          version: 0,
          publishedAt: null,
          createdAt: now,
          updatedAt: now,
        },
        WORKSPACE_COPY.versionNoteCopied,
      );
    },
    [write],
  );

  const removeMaterial = useCallback(
    async (document: AnyDocument) => {
      try {
        await repositories.documents.removeWithHistory(document.id);
        await refresh();
        toast.success(WORKSPACE_COPY.materialRemoved);
      } catch {
        toast.error(WORKSPACE_COPY.removeFailed);
      }
    },
    [refresh],
  );

  return { duplicateMaterial, removeMaterial, write };
}

export type WorkspaceActions = MaterialActions & {
  addMaterial: (kind: BuilderKind) => Promise<DocumentId | null>;
  saveSettings: (patch: ProjectPatch) => Promise<void>;
};

export function useWorkspaceActions(project: Project | null): WorkspaceActions {
  const queryClient = useQueryClient();
  const materials = useMaterialActions();
  const { write } = materials;

  const addMaterial = useCallback(
    (kind: BuilderKind): Promise<DocumentId | null> => {
      if (project === null) return Promise.resolve(null);
      const now = nowTimestamp();

      return write(
        {
          id: newDocumentId(),
          projectId: project.id,
          lessonPlanId: null,
          kind,
          status: "draft",
          version: 0,
          title: DEFAULT_TITLE[kind],
          subject: project.subject,
          grade: project.grade,
          validation: null,
          createdAt: now,
          updatedAt: now,
          publishedAt: null,
          createdBy: "teacher",
          body: BUILDERS[kind].createBody(),
        },
        WORKSPACE_COPY.versionNoteCreated,
      );
    },
    [project, write],
  );

  const saveSettings = useCallback(
    async (patch: ProjectPatch) => {
      if (project === null) return;
      try {
        await repositories.projects.save({
          ...project,
          ...patch,
          updatedAt: nowTimestamp(),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all(),
        });
        toast.success(WORKSPACE_COPY.saved);
      } catch {
        toast.error(WORKSPACE_COPY.saveFailed);
      }
    },
    [project, queryClient],
  );

  return { ...materials, addMaterial, saveSettings };
}

/** Opening title per kind. The teacher renames it in the header immediately. */
const DEFAULT_TITLE: Readonly<Record<BuilderKind, string>> = Object.freeze({
  lesson_plan: "Lecție nouă",
  worksheet: "Fișă de lucru nouă",
  assessment: "Evaluare nouă",
  story: "Poveste nouă",
  game: "Joc nou",
  presentation: "Prezentare nouă",
});
