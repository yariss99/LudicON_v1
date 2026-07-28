import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_PUBLICATION_PROFILES,
  PRIMA_PDE_SCHEMA_VERSION,
  getPublicationProfile,
} from '../dist/prima-publishing-delivery.js';

describe('Publishing & Delivery Engine contracts (FEATURE-005)', () => {
  it('exposes reusable publication profiles', () => {
    assert.equal(PRIMA_PDE_SCHEMA_VERSION, '1.0.0');
    assert.ok(DEFAULT_PUBLICATION_PROFILES.length >= 5);
    assert.ok(getPublicationProfile('classroom_print'));
    assert.ok(getPublicationProfile('inspection_portfolio'));
  });

  it('keeps inspection portfolio strict on assessment and objectives', () => {
    const profile = getPublicationProfile('inspection_portfolio');
    assert.ok(profile);
    assert.equal(profile?.requireAssessment, true);
    assert.equal(profile?.requireObjectives, true);
    assert.equal(profile?.destination, 'school_repository');
  });
});
