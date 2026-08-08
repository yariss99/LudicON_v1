import { z } from "zod";
import { ColorValue } from "../theme/color.js";
import { TextAlign } from "../theme/style.js";
import { EdgeInsets, Millimetres } from "./geometry.js";
import { PageId, SectionId } from "./identifiers.js";
import { InlineContent } from "./inline.js";

/**
 * The page is A4 and only A4.
 *
 * `format` is a literal rather than an enum because this product prints Romanian
 * school papers, and Romanian schools use A4. Modelling Letter "just in case"
 * would put a branch in every geometry function that nothing exercises, and the
 * day it is genuinely needed the honest change is a new enum member plus the
 * sizes table — which is a smaller diff than the speculative branches would
 * have been.
 */

export const PageFormat = z.literal("A4");
export type PageFormat = z.infer<typeof PageFormat>;

export const PageOrientation = z.enum(["portrait", "landscape"]);
export type PageOrientation = z.infer<typeof PageOrientation>;

/**
 * A running header or footer.
 *
 * `heightMm` is stored rather than measured because the content box depends on
 * it and the content box has to be computable without a DOM — the PDF worker has
 * no layout engine to ask.
 */
export const HeaderFooter = z.object({
  enabled: z.boolean().default(false),
  content: InlineContent.default([]),
  heightMm: Millimetres.default(10),
  align: TextAlign.default("center"),
  /** Covers are usually exempt; the teacher decides. */
  showOnFirstPage: z.boolean().default(false),
});
export type HeaderFooter = z.infer<typeof HeaderFooter>;

export const PageNumberFormat = z.enum([
  "number",
  "number_of_total",
  "labelled",
]);
export type PageNumberFormat = z.infer<typeof PageNumberFormat>;

export const PAGE_NUMBER_FORMAT_LABEL: Readonly<
  Record<PageNumberFormat, string>
> = Object.freeze({
  number: "1",
  number_of_total: "1 / 4",
  labelled: "Pagina 1 din 4",
});

export const PageNumbering = z.object({
  enabled: z.boolean().default(true),
  startAt: z.number().int().min(1).default(1),
  format: PageNumberFormat.default("number_of_total"),
  placement: z.enum(["header", "footer"]).default("footer"),
  align: TextAlign.default("center"),
  skipFirstPage: z.boolean().default(true),
});
export type PageNumbering = z.infer<typeof PageNumbering>;

export const PageSetup = z.object({
  format: PageFormat.default("A4"),
  orientation: PageOrientation.default("portrait"),
  /**
   * Defaults follow the Romanian school convention for a printed evaluation:
   * a wider top and bottom so the header and the pupil's name line have room,
   * and 18mm at the sides, which survives a standard two-hole punch.
   */
  margins: EdgeInsets.default({ top: 20, right: 18, bottom: 20, left: 18 }),
  header: HeaderFooter.prefault({}),
  footer: HeaderFooter.prefault({}),
  numbering: PageNumbering.prefault({}),
});
export type PageSetup = z.infer<typeof PageSetup>;

/**
 * Per-page deviations from the document setup.
 *
 * Every field is optional and absence means "inherit". A landscape table page
 * inside a portrait paper is the case this exists for.
 */
export const PageOverrides = z.object({
  orientation: PageOrientation.optional(),
  margins: EdgeInsets.optional(),
  header: HeaderFooter.optional(),
  footer: HeaderFooter.optional(),
  numbering: PageNumbering.optional(),
});
export type PageOverrides = z.infer<typeof PageOverrides>;

/**
 * One colour on the way to another.
 *
 * `at` is a PERCENTAGE along the run and not a fraction, because it is a number
 * a teacher reads in a panel and 0-100 is the scale they read it on; `opacity`
 * one field down is 0-1 for the opposite reason — nothing shows it to anyone.
 *
 * The colour is a `ColorValue`, so a stop may name a theme token and follow the
 * paper when the theme changes. That is the same bargain every other colour in
 * this model strikes, and the reason `resolveColor` exists — see
 * `../theme/color.ts`.
 */
export const GradientStop = z.object({
  color: ColorValue,
  at: z.number().min(0).max(100),
});
export type GradientStop = z.infer<typeof GradientStop>;

export const GradientKind = z.enum(["linear", "radial"]);
export type GradientKind = z.infer<typeof GradientKind>;

/**
 * A wash across the sheet.
 *
 * Two stops minimum, because one stop is a colour and the `color` field already
 * says that better. Four maximum, because a page background with five stops is
 * not a background any more; a teacher who genuinely needs one has left what
 * this product is for, and an unbounded array is an unbounded thing to draw and
 * to validate.
 *
 * `angleDeg` follows the CSS convention — 0° runs upward, 180° downward — so
 * that `gradientCss` below is a formatting function and not a coordinate
 * conversion. It is ignored by a radial gradient rather than being absent from
 * it: an optional field would mean every reader branching on the kind before it
 * could read the record, and switching a gradient from linear to radial and
 * back would lose the direction the teacher had chosen.
 */
export const PageGradient = z.object({
  kind: GradientKind.default("linear"),
  angleDeg: z.number().min(0).max(360).default(180),
  stops: z.array(GradientStop).min(2).max(4),
});
export type PageGradient = z.infer<typeof PageGradient>;

/**
 * How an image meets a sheet it is not the same shape as.
 *
 * Three answers and not the whole of `background-size`. `cover` fills and crops,
 * `contain` fits and leaves paper showing, `tile` repeats at the image's own
 * size. Everything else CSS offers — a pair of lengths, `round`, `space` — is a
 * measurement a teacher would have to take off an image file, and the PDF
 * worker would have to reproduce exactly.
 */
export const PageImageFit = z.enum(["cover", "contain", "tile"]);
export type PageImageFit = z.infer<typeof PageImageFit>;

/**
 * Nine anchors, not a pair of offsets.
 *
 * A percentage pair is what CSS takes and it is two more numbers for a teacher
 * to guess at. Nine named positions are what a crest, a watermark or a border
 * strip actually needs, and they are the nine cells of a grid a panel can draw
 * — which is how the control shows them.
 */
export const PageImagePosition = z.enum([
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
]);
export type PageImagePosition = z.infer<typeof PageImagePosition>;

/**
 * What is behind one sheet's text.
 *
 * Every field added here carries a DEFAULT, and that is load-bearing rather
 * than tidy: papers written before this schema grew are sitting in a teacher's
 * browser as `{ color, imageSrc, opacity }`, and they are re-parsed through
 * this object every time one is opened. A required `imageFit` would turn every
 * one of them into a document that no longer loads. With defaults an old record
 * round-trips: it parses, gains `cover`/`center`/`null`, and paints exactly as
 * it did before, because those three are the fixed rule `page-view.tsx` used to
 * hard-code.
 *
 * The four kinds — nothing, a colour, a gradient, an image — are not modelled
 * as a discriminated union, and that was a real choice. A union would make
 * "switch to an image and back" lose the colour, which is the thing a teacher
 * does while making up their mind. Instead the fields coexist in the schema and
 * the PANEL keeps them exclusive, clearing one as it writes the other, so what
 * is stored always has exactly one answer to "what is behind this". See
 * `builder/page-inspector.tsx`.
 */
export const PageBackground = z.object({
  color: ColorValue.nullable().default(null),
  gradient: PageGradient.nullable().default(null),
  imageSrc: z.string().max(4000).nullable().default(null),
  imageFit: PageImageFit.default("cover"),
  imagePosition: PageImagePosition.default("center"),
  opacity: z.number().min(0).max(1).default(1),
});
export type PageBackground = z.infer<typeof PageBackground>;

/**
 * The gradient as one CSS value, with every stop already resolved to a hex.
 *
 * It lives here rather than in the canvas for the reason `page-view.tsx` used
 * to give for having no gradient at all: the browser and the PDF worker must
 * not each hold a private opinion about what a teacher's background looks like.
 * One function, one answer, in the package both of them already read the schema
 * from.
 *
 * Stops are sorted before they are written. CSS clamps a stop that goes
 * backwards to the one before it, which silently turns a mis-ordered pair into
 * a hard edge — a paper that looks broken rather than one that looks like what
 * was asked for.
 */
export const gradientCss = (
  gradient: PageGradient,
  paint: (color: ColorValue) => string,
): string => {
  const stops = [...gradient.stops]
    .sort((a, b) => a.at - b.at)
    .map((stop) => `${paint(stop.color)} ${stop.at}%`)
    .join(", ");

  return gradient.kind === "radial"
    ? `radial-gradient(circle at center, ${stops})`
    : `linear-gradient(${gradient.angleDeg}deg, ${stops})`;
};

/** What each anchor means to `background-position`. */
export const PAGE_IMAGE_POSITION_CSS: Readonly<
  Record<PageImagePosition, string>
> = Object.freeze({
  "top-left": "left top",
  top: "center top",
  "top-right": "right top",
  left: "left center",
  center: "center center",
  right: "right center",
  "bottom-left": "left bottom",
  bottom: "center bottom",
  "bottom-right": "right bottom",
});

/**
 * What each fit means to `background-size` and `background-repeat`.
 *
 * `tile` is the only one that repeats, and it is `auto` rather than a size: the
 * point of a tile is the image's own dimensions, and scaling it first would
 * make the pattern a different pattern on every sheet size.
 */
export const PAGE_IMAGE_FIT_CSS: Readonly<
  Record<PageImageFit, { readonly size: string; readonly repeat: string }>
> = Object.freeze({
  cover: { size: "cover", repeat: "no-repeat" },
  contain: { size: "contain", repeat: "no-repeat" },
  tile: { size: "auto", repeat: "repeat" },
});

export const Page = z.object({
  id: PageId,
  sectionOrder: z.array(SectionId).default([]),
  /**
   * Whether free blocks may sit on this page.
   *
   * Exactly one page usually says yes — the cover, where a title is placed by
   * eye. Everywhere else, absolute coordinates and reflowing content are a
   * contradiction: a free block does not move when the section above it grows,
   * so it silently overlaps text the moment the teacher edits anything. Making
   * it a per-page permission rather than a global setting is what keeps the
   * cover expressive without letting that failure mode into the body.
   */
  allowsFreePlacement: z.boolean().default(false),
  background: PageBackground.nullable().default(null),
  overrides: PageOverrides.nullable().default(null),
});
export type Page = z.infer<typeof Page>;

/**
 * The setup that actually applies to one page.
 *
 * Written out field by field rather than `{ ...setup, ...page.overrides }`: a
 * hand-built override object with `{ margins: undefined }` — which is what a
 * form produces when a control is cleared — would spread that `undefined` over
 * a required field and hand the renderer a page with no margins.
 */
export const effectivePageSetup = (setup: PageSetup, page: Page): PageSetup => {
  const overrides = page.overrides;
  if (!overrides) return setup;

  return {
    format: setup.format,
    orientation: overrides.orientation ?? setup.orientation,
    margins: overrides.margins ?? setup.margins,
    header: overrides.header ?? setup.header,
    footer: overrides.footer ?? setup.footer,
    numbering: overrides.numbering ?? setup.numbering,
  };
};

/** Whether this page reserves vertical space for a running header. */
export const headerHeightMm = (
  setup: PageSetup,
  isFirstPage: boolean,
): number =>
  setup.header.enabled && (setup.header.showOnFirstPage || !isFirstPage)
    ? setup.header.heightMm
    : 0;

export const footerHeightMm = (
  setup: PageSetup,
  isFirstPage: boolean,
): number =>
  setup.footer.enabled && (setup.footer.showOnFirstPage || !isFirstPage)
    ? setup.footer.heightMm
    : 0;
