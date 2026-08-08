import type { Theme, ThemeColors } from "./theme.js";

/**
 * The default theme, built ONLY from the PRIMA palette.
 *
 * Every hex below is copied from `packages/ui/src/styles/palette.css` with the
 * variable named beside it. Nothing is invented: the palette file is the single
 * place the product's colours change, and a second, drifting copy of "roughly
 * blue" living in this package would defeat the point of that file existing.
 *
 * HARD RULE (Design Book CH01 §12.2, stated five times): no purple, no indigo,
 * no violet. `isForbiddenBrandHue` in `./color.ts` encodes the band; every hex
 * here sits outside it — the product's deepest blue, `--p-blue-700` #1d4ed8,
 * measures 224°, well clear of the 250° floor.
 *
 * The type sizes are print sizes, chosen against A4 rather than against a
 * screen: 11pt body with a 1.45 leading is the size a Romanian evaluation paper
 * is normally set at, and it fits roughly 45 lines in the default content box.
 * A theme scaled from a 16px web body — the rejected alternative — prints at
 * about 12pt and loses a line and a half per page, which is one question.
 */

const COLORS: ThemeColors = {
  text: "#0f172a", // --p-ink-900
  textMuted: "#475569", // --p-ink-600
  heading: "#0f172a", // --p-ink-900
  background: "#ffffff", // --p-paper
  surface: "#f1f5f9", // --p-ink-100
  accent: "#2563eb", // --p-blue-600
  accentSoft: "#eff6ff", // --p-blue-50
  border: "#e2e8f0", // --p-ink-200
  borderStrong: "#94a3b8", // --p-ink-400
  rule: "#94a3b8", // --p-ink-400 — the pupil's writing lines
  calloutInfo: "#eff6ff", // --p-blue-50
  calloutInfoText: "#1d4ed8", // --p-blue-700
  calloutSuccess: "#ecfdf5", // --p-emerald-50
  calloutSuccessText: "#047857", // --p-emerald-700
  calloutWarning: "#fffbeb", // --p-amber-50
  calloutWarningText: "#b45309", // --p-amber-700
  calloutDanger: "#fef2f2", // --p-red-50
  calloutDangerText: "#b91c1c", // --p-red-700
};

const CLASSIC: Theme = {
  id: "prima-clasic",
  name: "Clasic",
  typography: {
    /**
     * `--font-sans` from `packages/ui/src/styles/theme.css`, written out.
     *
     * The product has exactly three stacks and this paper had to be set in one
     * of them. It was Inter, which is a bug rather than a choice: theme.css
     * names Inter as a FORBIDDEN brand default (CH01 §5.1) and
     * `apps/web/src/main.tsx` loads only `@fontsource-variable/source-sans-3`
     * and `source-serif-4` — so every sheet printed so far fell through to
     * Segoe UI, and the paper on paper was nobody's decision.
     *
     * Of the three, the sans is the one an evaluation paper wants:
     *
     *  - it is what a Romanian primary class is taught to read. A paper for
     *    clasa a II-a is decoded letter by letter, and bracketed serifs are
     *    strokes a child has to learn to ignore at exactly the size — 11pt —
     *    where they are finest;
     *  - Source Sans 3 carries true comma-below ș and ț (U+0219 / U+021B). The
     *    display stack's first real fallback is Georgia, which resolves them to
     *    cedilla ş/ţ on most systems — a spelling mistake on a spelling test,
     *    printed under the teacher's name;
     *  - it is loaded, so the sheet on screen is the sheet in the printer.
     *
     * `--font-display` (Source Serif 4) was rejected on the first two points:
     * it is the product's heading face, right at 22pt on a cover and wrong for
     * forty lines of body copy aimed at a seven-year-old. `--font-mono` (IBM
     * Plex Mono) was rejected because `main.tsx` never loads it at all and
     * because Romanian prose does not set at fixed pitch.
     *
     * Carried as a STRING, not `var(--font-sans)`. This package is DOM-free —
     * it runs in the API and in the PDF worker, neither of which has a
     * stylesheet to resolve a custom property against — and a `var()` stored in
     * a document would render on screen and print as the browser's default.
     * The generic tail matters for the same reason: a worker with no fonts
     * installed still has to produce a readable ă.
     */
    fontFamily:
      '"Source Sans 3 Variable", "Source Sans 3", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
    scale: {
      h1: { sizePt: 22, weight: 700, lineHeight: 1.2, letterSpacingEm: -0.01 },
      h2: {
        sizePt: 16,
        weight: 700,
        lineHeight: 1.25,
        letterSpacingEm: -0.005,
      },
      h3: { sizePt: 13, weight: 600, lineHeight: 1.3, letterSpacingEm: 0 },
      h4: { sizePt: 11.5, weight: 600, lineHeight: 1.35, letterSpacingEm: 0 },
      body: { sizePt: 11, weight: 400, lineHeight: 1.45, letterSpacingEm: 0 },
      small: { sizePt: 9, weight: 400, lineHeight: 1.4, letterSpacingEm: 0.01 },
    },
  },
  colors: COLORS,
  spacing: {
    blockGapMm: 3,
    sectionGapMm: 6,
    columnGapMm: 6,
    listIndentMm: 6,
    paragraphSpacingMm: 2,
    /**
     * Sparse by design — only the layouts whose measure would otherwise
     * collapse. See the `z.partialRecord` note in `./theme.ts`.
     */
    columnGapByLayout: {
      "1/3+1/3+1/3": 5,
      "1/4x4": 4,
    },
  },
  borders: {
    hairlineMm: 0.2,
    regularMm: 0.3,
    thickMm: 0.6,
    defaultColor: "border",
  },
  radius: {
    noneMm: 0,
    smallMm: 1,
    mediumMm: 2,
    largeMm: 4,
  },
  exerciseDefaults: {
    promptSlot: "body",
    numbering: "arabic",
    showPoints: true,
    pointsLabel: "p.",
    spacingAboveMm: 4,
    spacingBelowMm: 4,
    answerRuleColor: "rule",
    answerRuleWidthMm: 0.2,
    /**
     * 9mm between writing lines. Romanian primary-school ruled paper is 8-9mm;
     * anything tighter and a pupil in clasa a II-a cannot fit their letters
     * between the rules.
     */
    answerLineGapMm: 9,
  },
};

/**
 * Annotated first, frozen second.
 *
 * `Object.freeze` on the literal directly would widen every token name to
 * `string` — `defaultColor: "border"` stops being a `ColorToken` — and the
 * type error that catches a typo in a token name goes with it.
 */
export const DEFAULT_THEME: Theme = Object.freeze(CLASSIC);
