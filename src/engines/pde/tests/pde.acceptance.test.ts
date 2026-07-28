import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  evaluatePublicationReadiness,
  listPublications,
  publicationStore,
  publish,
  reproducePublication,
  type PublishRequest,
} from "../index";

function baseRequest(
  overrides: Partial<PublishRequest> = {},
): PublishRequest {
  return {
    objectId: "obj_1",
    objectVersionId: "v1",
    objectTitle: "Fișă — Fracții",
    lessonProjectId: "lesson_1",
    destination: "print",
    channel: "printable_worksheet",
    format: "pdf",
    profileId: "classroom_print",
    previewKind: "print",
    previewCompleted: true,
    authorId: "t1",
    authorName: "Profesor",
    hasObjectives: true,
    hasAssessment: false,
    hasBrokenReferences: false,
    hasUnsavedChanges: false,
    missingAltText: false,
    pieOverall: 88,
    ...overrides,
  };
}

describe("FEATURE-005 Publishing & Delivery Engine", () => {
  beforeEach(() => {
    publicationStore.clear();
  });

  it("blocks publish without preview", () => {
    const readiness = evaluatePublicationReadiness(
      baseRequest({ previewCompleted: false }),
    );
    assert.equal(readiness.ok, false);
    assert.ok(readiness.findings.some((f) => f.id === "pde_preview"));
  });

  it("publishes when readiness passes and stores history", () => {
    const result = publish(baseRequest(), "## Exercițiu\nCompletează.");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.publication.status, "published");
    assert.ok(result.publication.artifacts.some((a) => a.kind === "package"));
    assert.equal(listPublications().length, 1);
    assert.equal(result.publication.objectId, "obj_1");
  });

  it("blocks inspection profile without assessment", () => {
    const result = publish(
      baseRequest({
        profileId: "inspection_portfolio",
        hasAssessment: false,
      }),
    );
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.ok(result.readiness.findings.some((f) => f.id === "pde_assessment"));
  });

  it("reproduces a previous publication", () => {
    const first = publish(baseRequest());
    assert.equal(first.ok, true);
    if (!first.ok) return;
    const second = reproducePublication(first.publication.publicationId, {
      id: "t1",
      name: "Profesor",
    });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal(
      second.publication.reproducedFromPublicationId,
      first.publication.publicationId,
    );
    assert.equal(listPublications().length, 2);
  });

  it("keeps publications linked to pedagogical object versions", () => {
    const result = publish(baseRequest());
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.publication.objectVersionId);
    assert.ok(result.publication.lessonProjectId);
  });
});
