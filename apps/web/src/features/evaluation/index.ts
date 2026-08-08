/**
 * The evaluation feature's public surface.
 *
 * Two screens and the renderer, and nothing else. The store, the command
 * wrappers and the canvas internals are deliberately absent: a route that
 * reached past `BuilderScreen` into `runCommand` would be a second write path
 * into the document, and the whole point of the command layer is that there is
 * exactly one.
 *
 * `DocumentRenderer` is exported because it is the piece with a life outside
 * this feature — the print path and the PDF worker will render a paper without
 * ever mounting a builder.
 */
export { CreateScreen } from "./create/create-screen";
export type { CreateScreenProps } from "./create/create-screen";

export { BuilderScreen } from "./builder/builder-screen";
export type { BuilderScreenProps } from "./builder/builder-screen";

export { DocumentRenderer } from "./canvas/document-renderer";
export type { DocumentRendererProps } from "./canvas/document-renderer";
export type { RenderMode } from "./canvas/block-view";

export { EVALUATION_COPY } from "./copy";
