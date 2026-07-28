import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  convertBlockType,
  deleteBlock,
  duplicateBlock,
  insertBlock,
  moveBlock,
  setBlockLocked,
  setBlockVisibility,
  updateBlockContent,
} from "../services/blockOps";
import { publishUpeDocument } from "../../publishing/services/upePublishBridge";
import { analyzeUpeDocument } from "../services/pieBridge";
import { createSampleWorksheet } from "../services/sampleDocument";
import { searchUpeDocument } from "../services/search";
import { validateUpeDocument } from "../services/validation";
import type {
  UpeAutosaveStatus,
  UpeBlockType,
  UpeBottomTab,
  UpeDocument,
  UpeLeftTab,
  UpePreviewMode,
  UpeRightTab,
  UpeVersionSnapshot,
} from "../types";

function snapshot(
  document: UpeDocument,
  summary: string,
  kind: UpeVersionSnapshot["kind"] = "autosave",
): UpeVersionSnapshot {
  return {
    id: `ver_${Date.now().toString(36)}`,
    label: document.versionLabel,
    createdAt: new Date().toISOString(),
    summary,
    kind,
    document: structuredClone(document),
  };
}

export function useUniversalEditor() {
  const { objectId = "demo" } = useParams();
  const [document, setDocument] = useState<UpeDocument>(() =>
    createSampleWorksheet(),
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    () => createSampleWorksheet().blocks[0]?.id ?? null,
  );
  const [leftTab, setLeftTab] = useState<UpeLeftTab>("structure");
  const [rightTab, setRightTab] = useState<UpeRightTab>("properties");
  const [bottomTab, setBottomTab] = useState<UpeBottomTab>("validation");
  const [previewMode, setPreviewMode] = useState<UpePreviewMode>("student");
  const [searchQuery, setSearchQuery] = useState("");
  const [bottomOpen, setBottomOpen] = useState(true);
  const [autosave, setAutosave] = useState<UpeAutosaveStatus>("saved");
  const [versions, setVersions] = useState<UpeVersionSnapshot[]>([]);
  const [publishProfileId, setPublishProfileId] = useState("classroom_print");
  const [previewCompleted, setPreviewCompleted] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const undoStack = useRef<UpeDocument[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sample = createSampleWorksheet();
    if (objectId && objectId !== "demo") {
      sample.id = objectId;
      sample.title = `Material · ${objectId}`;
    }
    setDocument(sample);
    setSelectedBlockId(sample.blocks[0]?.id ?? null);
    setVersions([snapshot(sample, "Deschidere editor", "named")]);
  }, [objectId]);

  const pieReport = useMemo(() => analyzeUpeDocument(document), [document]);

  const validationIssues = useMemo(
    () => validateUpeDocument(document, pieReport),
    [document, pieReport],
  );

  const searchHits = useMemo(
    () => searchUpeDocument(document, searchQuery),
    [document, searchQuery],
  );

  const pieSuggestions = useMemo(
    () =>
      pieReport.recommendations.slice(0, 4).map((r) => ({
        id: r.id,
        title: r.title,
        explanation: r.explanation,
        rationale: r.pedagogicalRationale,
      })),
    [pieReport],
  );

  const selectedBlock = useMemo(
    () => document.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [document.blocks, selectedBlockId],
  );

  const commit = useCallback((next: UpeDocument, summary: string) => {
    undoStack.current = [...undoStack.current.slice(-39), structuredClone(document)];
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    setDocument(stamped);
    setAutosave("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setVersions((prev) => [snapshot(stamped, summary), ...prev].slice(0, 30));
      setAutosave("saved");
    }, 400);
  }, [document]);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setDocument(prev);
    setAutosave("saved");
  }, []);

  const withBlocks = useCallback(
    (
      transform: (blocks: UpeDocument["blocks"]) => UpeDocument["blocks"],
      summary: string,
    ) => {
      commit({ ...document, blocks: transform(document.blocks) }, summary);
    },
    [commit, document],
  );

  return {
    objectId,
    document,
    selectedBlockId,
    selectedBlock,
    setSelectedBlockId,
    leftTab,
    setLeftTab,
    rightTab,
    setRightTab,
    bottomTab,
    setBottomTab,
    previewMode,
    setPreviewMode: (mode: UpePreviewMode) => {
      setPreviewMode(mode);
      setPreviewCompleted(true);
      setPublishMessage(null);
    },
    searchQuery,
    setSearchQuery,
    searchHits,
    bottomOpen,
    setBottomOpen,
    autosave,
    versions,
    validationIssues,
    pieSuggestions,
    pieScore: pieReport.scorecard.overall,
    rename: (title: string) => commit({ ...document, title }, "Titlu actualizat"),
    moveSelected: (direction: "up" | "down") => {
      if (!selectedBlockId) return;
      withBlocks((b) => moveBlock(b, selectedBlockId, direction), "Bloc mutat");
    },
    duplicateSelected: () => {
      if (!selectedBlockId) return;
      withBlocks((b) => duplicateBlock(b, selectedBlockId), "Bloc duplicat");
    },
    toggleLockSelected: () => {
      if (!selectedBlock || !selectedBlockId) return;
      withBlocks(
        (b) => setBlockLocked(b, selectedBlockId, !selectedBlock.locked),
        selectedBlock.locked ? "Bloc deblocat" : "Bloc blocat",
      );
    },
    hideSelected: () => {
      if (!selectedBlockId) return;
      withBlocks(
        (b) => setBlockVisibility(b, selectedBlockId, "hidden"),
        "Bloc ascuns",
      );
    },
    deleteSelected: () => {
      if (!selectedBlockId) return;
      withBlocks((b) => deleteBlock(b, selectedBlockId), "Bloc șters");
      setSelectedBlockId(null);
    },
    convertSelected: (type: UpeBlockType) => {
      if (!selectedBlockId) return;
      withBlocks(
        (b) => convertBlockType(b, selectedBlockId, type),
        "Tip bloc schimbat",
      );
    },
    updateSelectedContent: (text: string) => {
      if (!selectedBlockId) return;
      withBlocks(
        (b) => updateBlockContent(b, selectedBlockId, { text }),
        "Conținut actualizat",
      );
    },
    insert: (type: UpeBlockType) => {
      withBlocks(
        (b) => insertBlock(b, type, selectedBlockId),
        "Bloc adăugat",
      );
    },
    restoreVersion: (versionId: string) => {
      const version = versions.find((v) => v.id === versionId);
      if (!version) return;
      commit(
        {
          ...version.document,
          versionLabel: `restore-${version.label}`,
        },
        "Versiune restaurată",
      );
      setVersions((prev) => [
        snapshot(version.document, "Restaurare", "restore"),
        ...prev,
      ]);
    },
    undo,
    publishProfileId,
    setPublishProfileId,
    previewCompleted,
    markPreviewed: () => {
      setPreviewCompleted(true);
      setPublishMessage("Previzualizarea a fost confirmată. Poți publica.");
    },
    publishMessage,
    publish: () => {
      const result = publishUpeDocument({
        document,
        profileId: publishProfileId,
        previewMode,
        previewCompleted,
        autosaveIdle: autosave === "saved" || autosave === "idle",
      });
      if (!result.ok) {
        const first = result.readiness.findings[0];
        setPublishMessage(
          first
            ? `${result.reason} ${first.title}: ${first.recommendation}`
            : result.reason,
        );
        return;
      }
      setPublishMessage(
        `Publicat: ${result.publication.publicationId} → ${result.publication.destination} (${result.publication.format}).`,
      );
    },
  };
}
