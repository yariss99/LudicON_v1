import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  convertBlockType,
  deleteBlock,
  duplicateBlock,
  insertBlock,
  moveBlock,
  setBlockLocked,
  setBlockVisibility,
} from "../services/blockOps";
import { analyzeUpeDocument } from "../services/pieBridge";
import { createSampleWorksheet } from "../services/sampleDocument";
import { searchUpeDocument } from "../services/search";
import { validateUpeDocument } from "../services/validation";

describe("FEATURE-004 Universal Pedagogical Editor", () => {
  it("creates a sample pedagogical object with editable blocks", () => {
    const doc = createSampleWorksheet();
    assert.equal(doc.objectType, "worksheet");
    assert.ok(doc.blocks.length >= 4);
    assert.ok(doc.learningObjectives.length > 0);
  });

  it("supports universal block operations", () => {
    let blocks = createSampleWorksheet().blocks;
    const firstId = blocks[0]!.id;
    blocks = moveBlock(blocks, firstId, "down");
    assert.notEqual(blocks[0]!.id, firstId);

    blocks = duplicateBlock(blocks, firstId);
    assert.ok(blocks.length > createSampleWorksheet().blocks.length);

    blocks = setBlockLocked(blocks, firstId, true);
    const beforeDelete = blocks.length;
    blocks = deleteBlock(blocks, firstId);
    assert.equal(blocks.length, beforeDelete);

    blocks = setBlockLocked(blocks, firstId, false);
    blocks = setBlockVisibility(blocks, firstId, "hidden");
    assert.equal(blocks.find((b) => b.id === firstId)?.visibility, "hidden");

    blocks = convertBlockType(blocks, blocks[1]!.id, "paragraph");
    assert.equal(blocks[1]!.type, "paragraph");

    blocks = insertBlock(blocks, "reflection", blocks[0]!.id);
    assert.ok(blocks.some((b) => b.type === "reflection"));
  });

  it("searches across blocks and objectives", () => {
    const doc = createSampleWorksheet();
    const hits = searchUpeDocument(doc, "fracții");
    assert.ok(hits.length > 0);
    assert.ok(hits.some((h) => h.kind === "block" || h.kind === "objective"));
  });

  it("validates and bridges PIE recommendations", () => {
    const doc = createSampleWorksheet();
    const pie = analyzeUpeDocument(doc);
    assert.ok(pie.scorecard.overall >= 0);
    const issues = validateUpeDocument(doc, pie);
    assert.ok(Array.isArray(issues));

    const empty = {
      ...doc,
      title: "",
      learningObjectives: [],
      blocks: doc.blocks.filter((b) => b.type === "heading"),
    };
    const emptyIssues = validateUpeDocument(empty);
    assert.ok(emptyIssues.some((i) => i.id === "upe_title"));
    assert.ok(emptyIssues.some((i) => i.id === "upe_objectives"));
  });

  it("keeps editing export-independent (no file source fields)", () => {
    const doc = createSampleWorksheet();
    assert.equal("docxPath" in doc, false);
    assert.equal("pdfBytes" in doc, false);
  });
});
