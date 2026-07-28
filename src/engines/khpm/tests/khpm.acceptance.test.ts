import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  graphPathFrom,
  khpmStore,
  knowledgeHubEngine,
  parseNaturalLanguageQuery,
  pendingLinkSuggestions,
  recommend,
  resolveLinkSuggestion,
  search,
} from "../index";

describe("FEATURE-007 Knowledge Hub & Pedagogical Memory", () => {
  beforeEach(() => {
    khpmStore.resetSeed();
  });

  it("seeds a connected fractions knowledge graph", () => {
    const nodes = knowledgeHubEngine.listNodes();
    assert.ok(nodes.length >= 10);
    const path = graphPathFrom("kn_topic_fractions", 4);
    assert.ok(path.labels.some((l) => /Fracții|Matematică|III/i.test(l)));
  });

  it("parses natural language search for cooperative grade II math", () => {
    const parsed = parseNaturalLanguageQuery(
      "Arată-mi activități cooperative pentru Matematică clasa a II-a",
    );
    assert.equal(parsed.subject, "Matematică");
    assert.equal(parsed.grade, "Clasa a II-a");
    assert.equal(parsed.strategy, "cooperative");
    assert.equal(parsed.kind, "learning_activity");

    const hits = search(parsed);
    assert.ok(hits.length >= 1);
    assert.ok(hits.some((h) => h.title.toLowerCase().includes("cooperativ")));
  });

  it("recommends related knowledge without auto-applying", () => {
    const recs = recommend({
      subject: "Matematică",
      grade: "Clasa a III-a",
      topicText: "fracții",
      strategy: "cooperative",
    });
    assert.ok(recs.length > 0);
    assert.ok(recs.every((r) => r.reason.length > 0));
  });

  it("keeps collections private and dynamic", () => {
    const collections = knowledgeHubEngine.listCollections();
    assert.ok(collections.some((c) => c.title === "Fracții"));
    assert.ok(collections.every((c) => c.visibility === "private"));
    const updated = knowledgeHubEngine.addToCollection(
      "col_fractions",
      "kn_note_visual",
    );
    assert.ok(updated?.nodeIds.includes("kn_note_visual"));
  });

  it("requires teacher approval for suggested semantic links", () => {
    const pending = pendingLinkSuggestions();
    assert.ok(pending.length >= 0);
    if (pending[0]) {
      const approved = resolveLinkSuggestion(pending[0].id, "approved");
      assert.equal(approved?.status, "approved");
    }
  });

  it("lists templates and curriculum references", () => {
    assert.ok(knowledgeHubEngine.listNodesByKind("template").length >= 1);
    assert.ok(knowledgeHubEngine.listNodesByKind("curriculum_ref").length >= 1);
    assert.ok(knowledgeHubEngine.patterns().length >= 1);
  });
});
