import type { KnowledgeRegistry } from '../knowledge-registry.js';
import type { RelationshipEngine } from '../relationship-engine.js';
import type { KnowledgeEntity, KnowledgeSourceKind } from '../types.js';

type EvidenceSource = {
  kind: KnowledgeSourceKind;
  sourceId: string;
  label: string;
};

const SRC: EvidenceSource = {
  kind: 'official_curriculum',
  sourceId: 'ro-men-primary-2026',
  label: 'Curriculum național învățământ primar (RO)',
};

const FRAMEWORK: EvidenceSource = {
  kind: 'validated_framework',
  sourceId: 'bloom-udl-2026',
  label: 'Bloom + UDL validated frameworks',
};

const PLATFORM: EvidenceSource = {
  kind: 'platform_authored',
  sourceId: 'prima-ke-seed-001',
  label: 'PRIMA Knowledge Engine seed pack',
};

const BLUEPRINT: EvidenceSource = {
  kind: 'instructional_blueprint_model',
  sourceId: 'cs-005-blueprint',
  label: 'Instructional Blueprint Specification',
};

/**
 * Seed Romanian primary pedagogical knowledge graph (Math · Grade III · fractions).
 */
export function seedRomanianPrimary(
  registry: KnowledgeRegistry,
  relationships: RelationshipEngine,
): { entities: KnowledgeEntity[]; errors: string[] } {
  const add = (
    title: string,
    description: string,
    category: Parameters<KnowledgeRegistry['add']>[0]['category'],
    source: EvidenceSource = SRC,
    metadata: KnowledgeEntity['metadata'] = {},
  ) =>
    registry.add({
      title,
      description,
      category,
      evidenceSource: source,
      metadata,
      language: 'ro',
      status: 'published',
    });

  const results = [
    add('Curriculum Primar RO', 'National primary curriculum pack', 'curriculum', SRC, {
      locale: 'ro',
    }),
    add('Matematică', 'Subject: Mathematics', 'subjects', SRC, { subject: 'Matematică' }),
    add('Clasa a III-a', 'Grade band III', 'grades', SRC, { grade: 'Clasa a III-a' }),
    add(
      'Numerație și operații — fracții',
      'Competency area for early fractions',
      'competencies',
      SRC,
      { subject: 'Matematică', grade: 'Clasa a III-a', topic: 'fractions' },
    ),
    add(
      'Recunoaște fracții unitare',
      'Specific competency: identify unit fractions',
      'specific_competencies',
      SRC,
      { subject: 'Matematică', grade: 'Clasa a III-a', topic: 'fractions' },
    ),
    add(
      'Identifică fracții unitare ale unui întreg',
      'Learning objective for unit fractions',
      'learning_objectives',
      SRC,
      { subject: 'Matematică', grade: 'Clasa a III-a', topic: 'fractions', bloom: 'understand' },
    ),
    add(
      'Elevul poate arăta o treime dintr-o formă',
      'Observable learning outcome',
      'learning_outcomes',
      SRC,
      { topic: 'fractions' },
    ),
    add(
      'Învățare prin descoperire',
      'Inquiry / discovery pedagogical method',
      'pedagogical_methods',
      PLATFORM,
      { subject: 'Matematică' },
    ),
    add(
      'Lucru în perechi',
      'Collaborative teaching strategy',
      'teaching_strategies',
      PLATFORM,
    ),
    add(
      'Explorare cu plăcuțe de fracții',
      'Hands-on fraction tiles activity',
      'learning_activities',
      PLATFORM,
      { subject: 'Matematică', grade: 'Clasa a III-a', topic: 'fractions' },
    ),
    add(
      'Evaluare formativă pe parcurs',
      'Formative assessment strategy',
      'assessment_strategies',
      PLATFORM,
      { topic: 'fractions' },
    ),
    add(
      'Bilet de ieșire — colorează o treime',
      'Exit-ticket assessment instrument',
      'assessment_instruments',
      PLATFORM,
      { topic: 'fractions' },
    ),
    add(
      'Plăcuțe de fracții',
      'Concrete educational resource',
      'educational_resources',
      PLATFORM,
      { topic: 'fractions' },
    ),
    add(
      'Proiector / tablă interactivă',
      'Digital tool for shared modelling',
      'digital_tools',
      PLATFORM,
    ),
    add(
      'Suport vizual + extensie',
      'Differentiation: support and extension tiers',
      'differentiation_strategies',
      FRAMEWORK,
      { grade: 'Clasa a III-a', subject: 'Matematică' },
    ),
    add(
      'UDL — reprezentare multiplă',
      'Accessibility guideline: multiple means of representation',
      'accessibility_guidelines',
      FRAMEWORK,
    ),
    add(
      'Bloom — Înțelegere',
      'Bloom taxonomy level: Understand',
      'blooms_taxonomy',
      FRAMEWORK,
      { bloom: 'understand' },
    ),
    add(
      'DigCompEdu — Conținut digital',
      'Digital competence framework reference',
      'digital_competence_frameworks',
      FRAMEWORK,
    ),
    add(
      'Standard — aliniere obiectiv-activitate-evaluare',
      'Educational standard for backward design coherence',
      'educational_standards',
      BLUEPRINT,
    ),
    add(
      'Șablon lecție 45 minute',
      'Instructional template for a 45-minute lesson',
      'instructional_templates',
      PLATFORM,
      { duration: 45 },
    ),
  ];

  const entities: KnowledgeEntity[] = [];
  const errors: string[] = [];
  for (const r of results) {
    if ('error' in r) errors.push(r.error);
    else entities.push(r);
  }

  const byTitle = (title: string) => entities.find((e) => e.title === title)!;

  const links: Array<[string, string, Parameters<RelationshipEngine['add']>[0]['type']]> = [
    ['Curriculum Primar RO', 'Matematică', 'contains'],
    ['Curriculum Primar RO', 'Clasa a III-a', 'contains'],
    ['Matematică', 'Numerație și operații — fracții', 'contains'],
    ['Numerație și operații — fracții', 'Recunoaște fracții unitare', 'contains'],
    ['Recunoaște fracții unitare', 'Identifică fracții unitare ale unui întreg', 'supports'],
    ['Identifică fracții unitare ale unui întreg', 'Elevul poate arăta o treime dintr-o formă', 'supports'],
    ['Identifică fracții unitare ale unui întreg', 'Explorare cu plăcuțe de fracții', 'recommends'],
    ['Explorare cu plăcuțe de fracții', 'Învățare prin descoperire', 'uses'],
    ['Explorare cu plăcuțe de fracții', 'Lucru în perechi', 'uses'],
    ['Învățare prin descoperire', 'Evaluare formativă pe parcurs', 'supports'],
    ['Evaluare formativă pe parcurs', 'Identifică fracții unitare ale unui întreg', 'evaluates'],
    ['Bilet de ieșire — colorează o treime', 'Identifică fracții unitare ale unui întreg', 'evaluates'],
    ['Plăcuțe de fracții', 'Explorare cu plăcuțe de fracții', 'enriches'],
    ['Proiector / tablă interactivă', 'Explorare cu plăcuțe de fracții', 'supports'],
    ['Suport vizual + extensie', 'Explorare cu plăcuțe de fracții', 'supports'],
    ['UDL — reprezentare multiplă', 'Suport vizual + extensie', 'aligns_with'],
    ['Bloom — Înțelegere', 'Identifică fracții unitare ale unui întreg', 'aligns_with'],
    ['Standard — aliniere obiectiv-activitate-evaluare', 'Identifică fracții unitare ale unui întreg', 'requires'],
    ['Șablon lecție 45 minute', 'Explorare cu plăcuțe de fracții', 'contains'],
  ];

  for (const [from, to, type] of links) {
    const a = byTitle(from);
    const b = byTitle(to);
    if (!a || !b) {
      errors.push(`Missing seed entity for relation ${from} -> ${to}`);
      continue;
    }
    const edge = relationships.add({ type, fromId: a.id, toId: b.id });
    if ('error' in edge) errors.push(edge.error);
  }

  return { entities, errors };
}
