import type { RecommendationPolicy } from '../types.js';

/**
 * External recommendation policy configuration.
 * Policies are data — never hardcoded inside UI components.
 */
export const DEFAULT_RECOMMENDATION_POLICIES: RecommendationPolicy[] = [
  {
    policyId: 'pol-missing-assessment',
    trigger: ['BlueprintUpdated', 'QualityScoreChanged'],
    conditions: [{ type: 'objective_without_assessment' }],
    priority: 'important',
    category: 'assessment',
    recommendation: {
      titleTemplate: 'Assessment gap for {{objectiveId}}',
      descriptionTemplate:
        'Learning Objective {{objectiveTitle}} is not currently evaluated.',
      suggestedAction: 'Add a formative check aligned to {{objectiveId}}',
      alternativeActions: [
        'Link an existing assessment instrument',
        'Defer assessment design until review',
      ],
    },
    explanation: {
      whyTemplate:
        'Blueprint update shows objective {{objectiveId}} without a linked assessment.',
      improvesTemplate: 'Alignment between objectives and evaluation',
      impactTemplate: 'Teachers can verify whether {{objectiveTitle}} was achieved',
      relatedSection: 'assessment',
    },
    learningStrategy: 'suppress_on_ignore',
    expirationMs: 1000 * 60 * 60 * 24,
    confidenceBase: 0.85,
  },
  {
    policyId: 'pol-low-differentiation',
    trigger: ['QualityScoreChanged', 'BlueprintUpdated'],
    conditions: [
      { type: 'quality_below', field: 'differentiation', threshold: 0.5 },
      { type: 'missing_differentiation' },
    ],
    priority: 'suggested',
    category: 'differentiation',
    recommendation: {
      titleTemplate: 'Strengthen differentiation',
      descriptionTemplate: 'Consider adding differentiated learning activities.',
      suggestedAction: 'Add support and extension pathways for this class',
      alternativeActions: ['Reuse a saved differentiation template'],
    },
    explanation: {
      whyTemplate:
        'Differentiation quality score is {{differentiationScore}} (below {{threshold}}).',
      improvesTemplate: 'Inclusion and pacing for diverse learners',
      impactTemplate: 'More students can access the same objective at an appropriate challenge level',
      relatedSection: 'differentiation',
    },
    learningStrategy: 'suppress_on_dismiss',
    expirationMs: 1000 * 60 * 60 * 12,
    confidenceBase: 0.7,
  },
  {
    policyId: 'pol-previous-success',
    trigger: ['NewBlueprintCreated', 'MemoryUpdated'],
    conditions: [
      { type: 'similar_blueprint_exists', minRating: 4 },
    ],
    priority: 'idea',
    category: 'personalization',
    recommendation: {
      titleTemplate: 'Reuse prior success',
      descriptionTemplate:
        'You previously created a highly rated lesson on this topic: {{similarBlueprintTitle}}.',
      suggestedAction: 'Review {{similarBlueprintTitle}} before designing anew',
      alternativeActions: ['Start fresh without reuse'],
    },
    explanation: {
      whyTemplate:
        'Memory contains a similar Blueprint ({{similarBlueprintId}}) with rating {{similarBlueprintRating}}.',
      improvesTemplate: 'Faster Blueprint creation using known successful patterns',
      impactTemplate: 'Reduce repetitive design work while keeping teacher control',
      relatedSection: 'overview',
    },
    learningStrategy: 'reinforce_on_accept',
    expirationMs: 1000 * 60 * 60 * 6,
    confidenceBase: 0.65,
  },
  {
    policyId: 'pol-open-clarifications',
    trigger: ['ConversationAdvanced', 'WorkflowChanged'],
    conditions: [{ type: 'open_clarifications' }],
    priority: 'important',
    category: 'workflow',
    recommendation: {
      titleTemplate: 'Resolve open clarifications',
      descriptionTemplate:
        'There are open clarifications that may block Blueprint completeness: {{clarificationList}}.',
      suggestedAction: 'Answer the pending clarification questions',
      alternativeActions: ['Mark clarifications as deferred'],
    },
    explanation: {
      whyTemplate: 'Conversation advanced with unresolved clarifications.',
      improvesTemplate: 'Workflow continuity and Blueprint sufficiency',
      impactTemplate: 'Fewer incomplete sections later in review',
      relatedSection: 'conversation',
    },
    learningStrategy: 'suppress_on_dismiss',
    confidenceBase: 0.8,
  },
  {
    policyId: 'pol-accessibility-gap',
    trigger: ['QualityScoreChanged', 'BlueprintUpdated'],
    conditions: [
      { type: 'quality_below', field: 'accessibility', threshold: 0.5 },
      { type: 'accessibility_gap' },
    ],
    priority: 'suggested',
    category: 'accessibility',
    recommendation: {
      titleTemplate: 'Accessibility supports missing',
      descriptionTemplate:
        'Consider adding accessibility guidelines for this learning experience.',
      suggestedAction: 'Add multiple means of representation',
      alternativeActions: ['Link UDL checklist from Knowledge'],
    },
    explanation: {
      whyTemplate:
        'Accessibility quality score is {{accessibilityScore}} and no supports were recorded.',
      improvesTemplate: 'Equitable access to learning activities',
      impactTemplate: 'Broader usability for learners with diverse needs',
      relatedSection: 'accessibility',
    },
    learningStrategy: 'suppress_on_ignore',
    confidenceBase: 0.72,
  },
  {
    policyId: 'pol-incomplete-section',
    trigger: ['BlueprintUpdated', 'WorkflowChanged'],
    conditions: [{ type: 'section_incomplete', section: 'any' }],
    priority: 'critical',
    category: 'pedagogical',
    recommendation: {
      titleTemplate: 'Incomplete Blueprint section: {{sectionName}}',
      descriptionTemplate:
        'Section “{{sectionName}}” is still pending and may block approval.',
      suggestedAction: 'Complete section {{sectionName}}',
      alternativeActions: ['Request guided prompts for {{sectionName}}'],
    },
    explanation: {
      whyTemplate: 'Blueprint update left section {{sectionName}} incomplete.',
      improvesTemplate: 'Blueprint readiness for review and generation',
      impactTemplate: 'Avoid approval delays caused by missing instructional design elements',
      relatedSection: '{{sectionName}}',
    },
    learningStrategy: 'suppress_on_dismiss',
    confidenceBase: 0.9,
  },
  {
    policyId: 'pol-formative-preference',
    trigger: ['TeacherPreferenceUpdated', 'BlueprintUpdated'],
    conditions: [{ type: 'preference_match', field: 'assessment' }],
    priority: 'idea',
    category: 'assessment',
    recommendation: {
      titleTemplate: 'Align with your assessment preference',
      descriptionTemplate:
        'You usually prefer {{assessmentPreference}}. Consider applying it here.',
      suggestedAction: 'Add a {{assessmentPreference}} checkpoint',
      alternativeActions: ['Keep current assessment plan'],
    },
    explanation: {
      whyTemplate:
        'Teacher preference memory indicates a usual preference for {{assessmentPreference}}.',
      improvesTemplate: 'Personalization without replacing teacher choice',
      impactTemplate: 'Faster assessment design consistent with prior practice',
      relatedSection: 'assessment',
    },
    learningStrategy: 'reinforce_on_accept',
    confidenceBase: 0.6,
  },
  {
    policyId: 'pol-generation-resource-followup',
    trigger: ['GenerationCompleted', 'AssetModified'],
    conditions: [{ type: 'preference_match', field: 'generation_complete' }],
    priority: 'suggested',
    category: 'resource',
    recommendation: {
      titleTemplate: 'Review generated assets',
      descriptionTemplate:
        'Generation finished for {{completedAssetCount}} asset(s). Review quality before classroom use.',
      suggestedAction: 'Open Asset Studio for the newest asset',
      alternativeActions: ['Schedule review later'],
    },
    explanation: {
      whyTemplate: 'Generation completed with assets ready for teacher review.',
      improvesTemplate: 'Quality control before delivery',
      impactTemplate: 'Catch misalignment early while context is fresh',
      relatedSection: 'generation',
    },
    learningStrategy: 'suppress_on_ignore',
    confidenceBase: 0.75,
  },
];
