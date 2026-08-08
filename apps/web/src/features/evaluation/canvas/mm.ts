import { mmToPx, ptToMm } from "@ludicon/evaluation";
import type { CSSProperties } from "react";

/**
 * One custom property carries the whole page's scale.
 *
 * Everything inside a page is written as `calc(N * var(--mm))`, where `N` is
 * the millimetre figure straight out of the model. Zooming sets `--mm` on the
 * page element and the sheet, its margins, its type and its rules all move
 * together, because they are all the same multiplication.
 *
 * The rejected alternative was a CSS `transform: scale()` on the page. It looks
 * identical and it is not: a transform scales the rasterised result, so hairline
 * rules blur, text is laid out at one size and painted at another (hinting and
 * subpixel positioning stop matching the printed measure), and every
 * `getBoundingClientRect` inside the page returns transformed coordinates the
 * overlay then has to untransform. With `--mm` the browser lays the page out at
 * the requested size, so what is measured is what is drawn.
 *
 * The second rejected alternative was CSS `mm` units directly — `width: 210mm`.
 * They are correct and they cannot zoom: `mm` resolves against the CSS fixed
 * 96dpi reference and nothing in the cascade can scale it.
 */

/** Millimetres, as a CSS length that follows the page's `--mm`. */
export const mm = (value: number): string => `calc(${value} * var(--mm))`;

/** Points, for type. Converted through the model's own arithmetic. */
export const pt = (value: number): string => mm(ptToMm(value));

/**
 * The px value of one millimetre at a given zoom.
 *
 * `mmToPx` uses CSS's fixed 96dpi reference — the same number a stylesheet's
 * `mm` unit resolves against — so at zoom 1 the page measures exactly what a
 * browser would print it as.
 */
export const millimetreInPx = (zoom: number): number => mmToPx(1) * zoom;

/** The `--mm` declaration for a page box. */
export const scaleVariable = (zoom: number): CSSProperties =>
  ({ "--mm": `${millimetreInPx(zoom)}px` }) as CSSProperties;
