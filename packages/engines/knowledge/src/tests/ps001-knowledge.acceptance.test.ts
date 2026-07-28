import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ALL_KNOWLEDGE_DOMAINS,
  createPedagogicalKnowledgePlatform,
} from '../index.js';

describe('PS-001 Knowledge Engine — acceptance', () => {
  it('every seeded entity belongs to a validated knowledge domain', () => {
    const ke = createPedagogicalKnowledgePlatform();
    const entities = ke.registry.list();
    assert.ok(entities.length >= 20, 'seed should populate domains');
    for (const e of entities) {
      assert.ok(
        ALL_KNOWLEDGE_DOMAINS.includes(e.category),
        `invalid domain: ${e.category}`,
      );
    }
    const covered = new Set(entities.map((e) => e.category));
    for (const domain of ALL_KNOWLEDGE_DOMAINS) {
      assert.ok(covered.has(domain), `missing domain coverage: ${domain}`);
    }
  });

  it('every entity supports typed directional relationships', () => {
    const ke = createPedagogicalKnowledgePlatform();
    const edges = ke.relationships.list();
    assert.ok(edges.length > 0);
    for (const edge of edges) {
      assert.ok(edge.type, 'relationship must be typed');
      assert.notEqual(edge.fromId, edge.toId);
      assert.ok(ke.registry.get(edge.fromId));
      assert.ok(ke.registry.get(edge.toId));
    }
  });

  it('graph traversal is functional', () => {
    const ke = createPedagogicalKnowledgePlatform();
    const curriculum = ke.curriculum.list()[0];
    assert.ok(curriculum);
    const result = ke.traverse({
      startId: curriculum.id,
      direction: 'out',
      maxDepth: 4,
    });
    assert.ok(!('error' in result));
    assert.ok(result.nodes.length > 1);
    assert.ok(result.edges.length > 0);
    assert.ok(result.path.includes(curriculum.id));
  });

  it('semantic search returns relevant knowledge', () => {
    const ke = createPedagogicalKnowledgePlatform();
    const hits = ke.semanticSearch({
      text: 'fracții',
      mode: 'semantic',
      subject: 'Matematică',
      grade: 'Clasa a III-a',
      limit: 10,
    });
    assert.ok(hits.length > 0);
    assert.ok(hits[0].score > 0);
    assert.ok(hits[0].explanation.length > 0);
  });

  it('relationship search finds activities for a competency', () => {
    const ke = createPedagogicalKnowledgePlatform();
    const specific = ke.competencies.specific()[0];
    assert.ok(specific);
    const objective = ke.queryRelationships({
      fromId: specific.id,
      type: 'supports',
    });
    assert.ok(objective.length > 0);
    const objectiveId = objective[0].toId;
    const activities = ke.semanticSearch({
      mode: 'relationship',
      relatedToId: objectiveId,
      relationType: 'recommends',
      category: 'learning_activities',
    });
    assert.ok(activities.length > 0);
    assert.equal(activities[0].entity.category, 'learning_activities');
  });

  it('recommendation API provides explainable suggestions', () => {
    const ke = createPedagogicalKnowledgePlatform();
    const objective = ke.queryKnowledge({
      category: 'learning_objectives',
      topic: 'fractions',
    })[0];
    assert.ok(objective);
    const rec = ke.recommend({
      objectiveId: objective.id,
      grade: 'Clasa a III-a',
      subject: 'Matematică',
      topic: 'fractions',
    });
    assert.ok(rec.recommendedActivities.length > 0);
    assert.ok(rec.recommendedMethods.length > 0);
    assert.ok(rec.suggestedResources.length > 0);
    assert.ok(rec.alternativeAssessments.length > 0);
    assert.ok(rec.digitalToolSuggestions.length > 0);
    assert.ok(rec.differentiationOptions.length > 0);
    assert.ok(rec.confidenceScore > 0);
    assert.ok(rec.explanation.includes('Recommendations'));
  });

  it('version history is preserved on update', () => {
    const ke = createPedagogicalKnowledgePlatform({ seed: false });
    const created = ke.addEntity({
      title: 'Test Objective',
      description: 'v1',
      category: 'learning_objectives',
      evidenceSource: {
        kind: 'platform_authored',
        sourceId: 'test',
        label: 'test',
      },
    });
    assert.ok(!('error' in created));
    const updated = ke.updateEntity(created.id, { description: 'v2' });
    assert.ok(!('error' in updated));
    assert.notEqual(updated.version, '1.0.0');
    const history = ke.registry.historyOf(created.id);
    assert.ok(history.length >= 2);
    assert.equal(history[0].description, 'v2');
  });

  it('duplicate entities are prevented', () => {
    const ke = createPedagogicalKnowledgePlatform({ seed: false });
    const a = ke.addEntity({
      title: 'Same Title',
      description: 'one',
      category: 'pedagogical_methods',
      evidenceSource: {
        kind: 'platform_authored',
        sourceId: 't',
        label: 't',
      },
    });
    assert.ok(!('error' in a));
    const b = ke.addEntity({
      title: 'Same Title',
      description: 'two',
      category: 'pedagogical_methods',
      evidenceSource: {
        kind: 'platform_authored',
        sourceId: 't',
        label: 't',
      },
    });
    assert.ok('error' in b);
    assert.match(b.error, /Duplicate/);
  });

  it('all knowledge is traceable to its source', () => {
    const ke = createPedagogicalKnowledgePlatform();
    for (const e of ke.registry.list()) {
      assert.ok(e.evidenceSource.sourceId);
      assert.ok(e.evidenceSource.label);
      assert.ok(e.evidenceSource.kind);
    }
    const report = ke.validate({ all: true });
    assert.equal(report.ok, true, JSON.stringify(report.issues, null, 2));
  });

  it('cache invalidates on version changes', () => {
    const ke = createPedagogicalKnowledgePlatform();
    const first = ke.queryKnowledge({ category: 'learning_activities' });
    assert.ok(first.length > 0);
    assert.ok(ke.cache.size() >= 1);
    const activity = first[0];
    ke.updateEntity(activity.id, { description: `${activity.description} (edited)` });
    assert.equal(ke.cache.size(), 0);
    const second = ke.queryKnowledge({ category: 'learning_activities' });
    assert.ok(second.some((e) => e.id === activity.id && e.description.includes('edited')));
  });

  it('supports archive, merge, relationship management, and bulk import', () => {
    const ke = createPedagogicalKnowledgePlatform({ seed: false });
    const bulk = ke.bulkImport([
      {
        title: 'Keep Method',
        description: 'a',
        category: 'pedagogical_methods',
        evidenceSource: {
          kind: 'platform_authored',
          sourceId: 'b',
          label: 'b',
        },
        status: 'published',
      },
      {
        title: 'Absorb Method',
        description: 'b',
        category: 'pedagogical_methods',
        evidenceSource: {
          kind: 'platform_authored',
          sourceId: 'b',
          label: 'b',
        },
        status: 'published',
      },
      {
        title: 'Linked Activity',
        description: 'c',
        category: 'learning_activities',
        evidenceSource: {
          kind: 'platform_authored',
          sourceId: 'b',
          label: 'b',
        },
        status: 'published',
      },
    ]);
    assert.equal(bulk.added.length, 3);
    const [keep, absorb, activity] = bulk.added;
    const edge = ke.addRelationship({
      type: 'uses',
      fromId: activity.id,
      toId: absorb.id,
    });
    assert.ok(!('error' in edge));
    const merged = ke.mergeDuplicates(keep.id, absorb.id);
    assert.ok(!('error' in merged));
    const repointed = ke.queryRelationships({
      fromId: activity.id,
      type: 'uses',
    });
    assert.ok(repointed.some((e) => e.toId === keep.id));
    const archived = ke.archiveEntity(activity.id);
    assert.ok(!('error' in archived));
    assert.equal(archived.status, 'archived');
  });

  it('architecture covers domain services and future curriculum extensions', () => {
    const ke = createPedagogicalKnowledgePlatform();
    assert.ok(ke.curriculum.list().length > 0);
    assert.ok(ke.competencies.list().length > 0);
    assert.ok(ke.methods.list().length > 0);
    assert.ok(ke.activities.list().length > 0);
    assert.ok(ke.assessments.list().length > 0);
    assert.ok(ke.resources.list().length > 0);

    const ext = ke.addEntity({
      title: 'Curriculum Extensie STEM',
      description: 'Future curriculum pack',
      category: 'curriculum',
      evidenceSource: {
        kind: 'external_provider',
        sourceId: 'future-stem',
        label: 'External STEM curriculum provider',
      },
      status: 'published',
    });
    assert.ok(!('error' in ext));
    assert.ok(ke.curriculum.list().some((c) => c.id === ext.id));
  });
});
