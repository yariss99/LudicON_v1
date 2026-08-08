import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, type VersionedRepository } from "@ludicon/data-access";
import {
  hasBlockingIssues,
  nowTimestamp,
  type DocumentId,
  type Timestamp,
  type Version,
} from "@ludicon/domain";
import { toast } from "@ludicon/ui";

import { newDocumentId } from "../../lib/documents";
import { COPY } from "./copy";
import type {
  BuilderConfig,
  BuilderContextValue,
  BuilderDocument,
  BuilderPanel,
  BuilderRouteParams,
  SaveState,
} from "./types";

/** CH-LESSON-001 puts autosave between 600 and 800ms. */
const AUTOSAVE_DELAY_MS = 700;

export type BuilderRepository<TBody> = VersionedRepository<
  BuilderDocument<TBody>,
  Version<BuilderDocument<TBody>>
>;

export type BuilderState<TBody> =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "failed" }
  | { status: "ready"; builder: BuilderContextValue<TBody> };

/**
 * The shared hook spine.
 *
 * One implementation of autosave, dirty tracking, version history, validation,
 * publish, archive, duplicate and restore — replacing five 70%-identical hooks.
 */
export function useBuilder<TBody>(
  config: BuilderConfig<TBody>,
  repository: BuilderRepository<TBody>,
  params: BuilderRouteParams,
): BuilderState<TBody> {
  const queryClient = useQueryClient();
  const { documentId } = params;

  const stored = useQuery({
    queryKey: queryKeys.documents.detail(documentId),
    queryFn: () => repository.get(documentId),
  });

  const versions = useQuery({
    queryKey: queryKeys.documents.versions(documentId),
    queryFn: () => repository.listVersions(documentId),
  });

  const [draft, setDraft] = useState<BuilderDocument<TBody> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Timestamp | null>(null);
  const [sectionId, setSectionId] = useState(config.sections[0]?.id ?? "");
  const [panel, setPanel] = useState<BuilderPanel>("guidance");
  const [dismissed, setDismissed] = useState<readonly string[]>([]);

  // Seed the local draft once, then let edits own it. Refetches must not stomp
  // on unsaved typing — "work cannot be silently lost" (CH07).
  const loaded = stored.data ?? null;
  useEffect(() => {
    setDraft((current) => (current === null ? loaded : current));
    if (loaded !== null) setLastSavedAt(loaded.updatedAt);
  }, [loaded]);

  const draftRef = useRef<BuilderDocument<TBody> | null>(null);
  draftRef.current = draft;

  const persist = useCallback(
    async (
      document: BuilderDocument<TBody>,
      note?: string,
    ): Promise<BuilderDocument<TBody> | null> => {
      setSaving("saving");
      try {
        const next: BuilderDocument<TBody> = {
          ...document,
          version: document.version + 1,
          updatedAt: nowTimestamp(),
        };
        const written = await repository.saveWithVersion(next, note);
        setDraft(written);
        setDirty(false);
        setSaving("saved");
        setLastSavedAt(written.updatedAt);
        await queryClient.invalidateQueries({
          queryKey: queryKeys.documents.all(),
        });
        return written;
      } catch {
        setSaving("failed");
        toast.error(COPY.saveFailed);
        return null;
      }
    },
    [queryClient, repository],
  );

  // Autosave. The timer is keyed on the draft, so every keystroke restarts it
  // and a quiet moment commits.
  useEffect(() => {
    if (!dirty || draft === null) return;
    const timer = window.setTimeout(() => {
      void persist(draft);
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, draft, persist]);

  const issues = useMemo(
    () => (draft === null ? [] : config.validate(draft)),
    [config, draft],
  );

  const suggestions = useMemo(() => {
    if (draft === null) return [];
    return config
      .suggest(draft)
      .filter((suggestion) => !dismissed.includes(suggestion.id))
      .slice(0, 3);
  }, [config, draft, dismissed]);

  const edit = useCallback(
    (change: (current: BuilderDocument<TBody>) => BuilderDocument<TBody>) => {
      setDraft((current) => (current === null ? current : change(current)));
      setDirty(true);
    },
    [],
  );

  const saveNow = useCallback(async () => {
    const current = draftRef.current;
    if (current !== null) await persist(current);
  }, [persist]);

  const runValidation = useCallback(() => {
    const current = draftRef.current;
    if (current === null) return;
    const found = config.validate(current);
    edit((document) => ({
      ...document,
      validation: { issues: found, checkedAt: nowTimestamp() },
    }));
    toast.success(found.length === 0 ? COPY.checkClear : COPY.checkFound);
  }, [config, edit]);

  const publish = useCallback(async () => {
    const current = draftRef.current;
    if (current === null) return;
    const found = config.validate(current);
    const report = { issues: found, checkedAt: nowTimestamp() };
    if (hasBlockingIssues(report)) {
      edit((document) => ({ ...document, validation: report }));
      toast.warning(COPY.publishBlocked);
      return;
    }
    const written = await persist({
      ...current,
      status: "published",
      validation: report,
      publishedAt: nowTimestamp(),
    });
    if (written !== null) toast.success(COPY.published);
  }, [config, edit, persist]);

  const archive = useCallback(async () => {
    const current = draftRef.current;
    if (current === null) return;
    const written = await persist({ ...current, status: "archived" });
    if (written !== null) toast.success(COPY.archived);
  }, [persist]);

  const duplicate = useCallback(async (): Promise<DocumentId | null> => {
    const current = draftRef.current;
    if (current === null) return null;
    const copy: BuilderDocument<TBody> = {
      ...current,
      id: newDocumentId(),
      title: `${current.title} ${COPY.copySuffix}`,
      status: "draft",
      version: 0,
      publishedAt: null,
      createdAt: nowTimestamp(),
      updatedAt: nowTimestamp(),
    };
    try {
      await repository.saveWithVersion(copy, COPY.versionNoteDuplicate);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.documents.all(),
      });
      toast.success(COPY.duplicated);
      return copy.id;
    } catch {
      toast.error(COPY.saveFailed);
      return null;
    }
  }, [queryClient, repository]);

  const restoreVersion = useCallback(
    async (versionId: string) => {
      const current = draftRef.current;
      const snapshot = (versions.data ?? []).find(
        (entry) => entry.id === versionId,
      );
      if (current === null || snapshot === undefined) return;
      const written = await persist(
        {
          ...current,
          title: snapshot.snapshot.title,
          body: snapshot.snapshot.body,
        },
        `${COPY.versionNoteRestore} ${snapshot.version}`,
      );
      if (written !== null) toast.success(COPY.restored);
    },
    [persist, versions.data],
  );

  const applySuggestion = useCallback(
    (suggestionId: string) => {
      const match = suggestions.find((entry) => entry.id === suggestionId);
      if (match === undefined) return;
      edit((document) => ({ ...document, body: match.apply(document.body) }));
      setSectionId(match.sectionId);
      setDismissed((current) => [...current, suggestionId]);
      toast.success(COPY.suggestionApplied);
    },
    [edit, suggestions],
  );

  if (stored.isPending) return { status: "loading" };
  if (stored.isError) return { status: "failed" };
  if (draft === null) return { status: "missing" };

  return {
    status: "ready",
    builder: {
      document: draft,
      versions: versions.data ?? [],
      sections: config.sections,
      sectionId,
      panel,
      dirty,
      saving,
      lastSavedAt,
      issues,
      suggestions,
      setSectionId,
      setPanel,
      patch: (body) => edit((document) => ({ ...document, body })),
      renameTitle: (title) => edit((document) => ({ ...document, title })),
      saveNow,
      runValidation,
      publish,
      archive,
      duplicate,
      restoreVersion,
      applySuggestion,
      dismissSuggestion: (id) => setDismissed((current) => [...current, id]),
    },
  };
}
