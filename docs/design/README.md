# PRIMA Design

## Source of truth

**Philosophical foundation:** [DOCUMENT-000 — The PRIMA Manifesto](../product/DOCUMENT-000_PRIMA_MANIFESTO.md)

| Layer | Document |
|-------|----------|
| Visual identity (Absolute) | [Ch.1 Creative Direction](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) |
| Visual grammar (Critical) | [Ch.2 PDL](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) |
| Pedagogical components (Critical) | [Ch.3 PDS](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) |
| Experience patterns (Critical) | [Ch.4 Experience Patterns](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) |
| Teacher journeys (Critical) | [Ch.5 Teacher Journeys](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md) |
| Motion & interaction (Critical) | [Ch.6 Motion & Interaction](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md) |
| Accessibility (Critical) | [Ch.7 Accessibility & Inclusive Design](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md) |
| Responsive & adaptive (Critical) | [Ch.8 Responsive & Adaptive Experience](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md) |
| AI interaction (Absolute) | [Ch.9 PAIM](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md) |
| Product blueprint (Absolute) | [Ch.10 Product Blueprint & Screen Library](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) |

**[DESIGN-002](./DESIGN-002_PRIMA_DESIGN_SPECIFICATION.md)** · **[DESIGN-001](./DESIGN-001_PRIMA_PRODUCT_DESIGN_SYSTEM.md)** (executable)

## Design Book

| Chapter | Document |
|---------|----------|
| Ch.1 Creative Direction | [DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md](./DESIGN_BOOK_CH01_CREATIVE_DIRECTION.md) |
| Ch.2 PDL | [DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md](./DESIGN_BOOK_CH02_PRIMA_DESIGN_LANGUAGE.md) |
| Ch.3 PDS | [DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md](./DESIGN_BOOK_CH03_PEDAGOGICAL_DESIGN_SYSTEM.md) |
| Ch.4 Experience Patterns | [DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md](./DESIGN_BOOK_CH04_EXPERIENCE_PATTERNS.md) |
| Ch.5 Teacher Journeys | [DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md](./DESIGN_BOOK_CH05_TEACHER_JOURNEYS.md) |
| Ch.6 Motion & Interaction | [DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md](./DESIGN_BOOK_CH06_MOTION_INTERACTION_SYSTEM.md) |
| Ch.7 Accessibility | [DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md](./DESIGN_BOOK_CH07_ACCESSIBILITY_INCLUSIVE_DESIGN.md) |
| Ch.8 Responsive & Adaptive | [DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md](./DESIGN_BOOK_CH08_RESPONSIVE_ADAPTIVE_EXPERIENCE.md) |
| Ch.9 PAIM | [DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md](./DESIGN_BOOK_CH09_PRIMA_AI_INTERACTION_MODEL.md) |
| Ch.10 Product Blueprint & Screen Library | [DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md](./DESIGN_BOOK_CH10_PRODUCT_BLUEPRINT.md) |
| Ch.11 Teacher Desk (HOME-001) | [DESIGN_BOOK_CH11_TEACHER_DESK.md](./DESIGN_BOOK_CH11_TEACHER_DESK.md) |
| Ch.12 Lesson Design Studio (LESSON-001) | [DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md](./DESIGN_BOOK_CH12_LESSON_DESIGN_STUDIO.md) |

### Authority (design)

1. DOCUMENT-000 — ethics / teacher role  
2. DB-CH01 — visual identity  
3. DB-CH09 PAIM — AI experience  
4. DB-CH10 Blueprint — screen inventory (no unlisted screens)  
5. DB-CH02…08 — grammar · components · patterns · journeys · motion · a11y · responsive  
6. DESIGN-002 — product UX specification  
7. Surface chapters — named screen visual constitutions  
8. DESIGN-001 + tokens — executable system  

## Runtime

The shared token layer lives in `packages/ui`:

| | Path |
|---|---|
| Palette (raw values) | `packages/ui/src/styles/palette.css` |
| Semantic tokens | `packages/ui/src/styles/tokens.css` |
| Tailwind `@theme` mapping | `packages/ui/src/styles/theme.css` |
| Light / dark / system | `packages/ui/src/theme/theme-provider.tsx` |

App-local, pending migration into `packages/ui`:

| | Path |
|---|---|
| Legacy tokens | `apps/web/src/styles/prima-design-tokens.css` |
| Components | `apps/web/src/design-system/` |
| Showcase route | `/design-system` |

Components reference semantic tokens only — never the raw palette, never a hex.
