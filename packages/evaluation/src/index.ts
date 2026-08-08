/**
 * @ludicon/evaluation — the canonical document model for an evaluation paper.
 *
 * A Project here is one A4 sheet (or several) authored visually, printed, and
 * handed to a class, together with the barem that marks it. This package owns
 * the shape of that document and nothing else: it is DOM-free by construction,
 * so the same model is parsed by the API, laid out by the PDF worker, and
 * edited in the browser without any of the three holding a different opinion
 * about what a paper is.
 *
 * Four decisions run through everything below and are argued for where they are
 * made:
 *
 *  - the document is NORMALISED, not a tree (`model/project.ts`) — selection is
 *    O(1), a move is two array edits, and undo diffs stay small;
 *  - every mutation is an INVERTIBLE COMMAND (`commands/types.ts`) — undo is the
 *    foundation, not a later retrofit over document snapshots;
 *  - exercises are OPAQUE (`exercises/definition.ts`) — the registry owns their
 *    config, so a new question type ships without touching this schema;
 *  - geometry is in MILLIMETRES (`model/geometry.ts`) — the paper is the unit of
 *    truth, and pixels only mean something once a DPI is known.
 *
 * Built on `@ludicon/domain`, never around it: `Timestamp`, `TeacherId`,
 * `Discipline`, `GradeLevel` and `ValidationIssue` are imported, not redeclared.
 */
export * from "./model/index.js";
export * from "./theme/index.js";
export * from "./layout/index.js";
export * from "./commands/index.js";
export * from "./exercises/index.js";
export * from "./validation/index.js";
