import { useMemo, type ReactNode } from "react";
import {
  contentBox,
  pageSize,
  resolveColor,
  type EvaluationProject,
  type ExerciseRegistry,
  type Theme,
} from "@ludicon/evaluation";

import { InlineView } from "../canvas/inline-view";
import { mm, pt, scaleVariable } from "../canvas/mm";
import { BAREM_COPY } from "./copy";
import { baremRows, baremTotal, type BaremRow } from "./barem-rows";
import { useBaremSheets } from "./use-barem-sheets";

/**
 * The barem, on A4 sheets that match the paper it marks.
 *
 * Drawn from the teacher's own theme — `resolveColor`, `theme.typography.scale`
 * and the document's own `pageSetup.margins` — rather than from the product's
 * semantic tokens. That is the same decision `canvas/block-view.tsx` states and
 * for the same reason: the tokens follow the reader's light/dark preference and
 * a printed sheet does not have one. A barem set in the app's UI colours would
 * be the one page in the print job that did not look like the document.
 *
 * The rejected alternative was printing the barem as an ordinary web table and
 * letting the browser paginate it. It prints, and it prints something that is
 * visibly not part of the same document: different measure, different type,
 * margins only on the first and last page — see `use-barem-sheets.ts` for why
 * the last of those cannot be fixed with padding.
 *
 * A row never switches on an exercise type. Everything it shows comes from
 * `barem-rows.ts`, which reads the registry; this file only lays it out.
 */

/**
 * The two reserved bands, in millimetres.
 *
 * Fixed rather than measured because this file draws both of them: a title, a
 * subtitle and a rule are a known height, and measuring something whose size
 * you chose is a measurement that can only ever confirm what you already know —
 * at the cost of a third render pass before printing.
 */
const HEAD_MM = 20;
const FOOT_MM = 12;

export interface BaremSheetsProps {
  document: EvaluationProject;
  registry: ExerciseRegistry;
}

export function BaremSheets({ document, registry }: BaremSheetsProps) {
  const theme = document.theme;
  const rows = useMemo(
    () => baremRows(document, registry),
    [document, registry],
  );

  const size = pageSize(document.pageSetup);
  /**
   * `isFirstPage: false` deliberately. The flag exists so a cover can suppress
   * its running header; a barem sheet is never a cover, and passing `true` for
   * the first one would give sheet 1 a different content height from sheet 2
   * and paginate the two differently.
   */
  const box = contentBox(document.pageSetup, false);

  const { sheets, measureRef } = useBaremSheets(rows, {
    contentWidthMm: box.width,
    contentHeightMm: box.height,
    headMm: HEAD_MM,
    footMm: FOOT_MM,
  });

  // An empty barem prints nothing at all rather than a sheet saying so: a blank
  // page in a print job reads as a fault, and the checklist has already told
  // the teacher there are no exercises.
  if (rows.length === 0) return null;

  const total = baremTotal(rows);
  const title =
    document.meta.title.trim() === ""
      ? BAREM_COPY.sheetTitleUntitled
      : BAREM_COPY.sheetTitle(document.meta.title.trim());

  return (
    <div
      style={{
        ...scaleVariable(1),
        fontFamily: theme.typography.fontFamily,
        color: resolveColor(theme, "text"),
      }}
    >
      {sheets === null ? (
        /**
         * The measuring pass: every row at the sheet's true content width, so
         * the heights read here are the heights they will have once they are
         * cut into sheets. It is inside the hidden print surface, so it is
         * never seen; `use-barem-sheets.ts` replaces it before the next paint.
         */
        <div ref={measureRef} style={{ width: mm(box.width) }}>
          {rows.map((row) => (
            <RowView key={row.blockId} row={row} theme={theme} />
          ))}
        </div>
      ) : (
        sheets.map((sheetRows, index) => (
          <div
            key={sheetRows[0]?.blockId ?? index}
            data-barem-sheet
            style={{
              position: "relative",
              width: mm(size.width),
              height: mm(size.height),
              backgroundColor: resolveColor(theme, "background"),
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: mm(box.x),
                top: mm(box.y),
                width: mm(box.width),
                height: mm(box.height),
              }}
            >
              {index === 0 ? <Head theme={theme} title={title} /> : null}

              {sheetRows.map((row) => (
                <RowView key={row.blockId} row={row} theme={theme} />
              ))}

              {index === sheets.length - 1 ? (
                <Foot theme={theme} total={total} />
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Head({ theme, title }: { theme: Theme; title: string }) {
  const heading = theme.typography.scale.h2;

  return (
    <header
      style={{
        height: mm(HEAD_MM),
        borderBottomStyle: "solid",
        borderBottomWidth: mm(theme.borders.regularMm),
        borderBottomColor: resolveColor(theme, "borderStrong"),
        marginBottom: mm(4),
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: pt(heading.sizePt),
          fontWeight: heading.weight,
          lineHeight: heading.lineHeight,
          color: resolveColor(theme, "heading"),
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: 0,
          marginTop: mm(1),
          fontSize: pt(theme.typography.scale.small.sizePt),
          lineHeight: theme.typography.scale.small.lineHeight,
          color: resolveColor(theme, "textMuted"),
        }}
      >
        {BAREM_COPY.sheetSubtitle}
      </p>
    </header>
  );
}

/**
 * The total sits in the reserved band at the bottom of the content box, not
 * after the last row: a total that floats up under a short final sheet reads as
 * belonging to that sheet's last exercise.
 */
function Foot({ theme, total }: { theme: Theme; total: number }) {
  return (
    <footer
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: mm(FOOT_MM),
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: mm(3),
        borderTopStyle: "solid",
        borderTopWidth: mm(theme.borders.regularMm),
        borderTopColor: resolveColor(theme, "borderStrong"),
        fontSize: pt(theme.typography.scale.body.sizePt),
        fontWeight: theme.typography.scale.h4.weight,
      }}
    >
      <span>{BAREM_COPY.total}</span>
      <span>{BAREM_COPY.pointsLabel(total)}</span>
    </footer>
  );
}

/**
 * One entry.
 *
 * `data-barem-row` is what `print.css` hangs `break-inside: avoid` on: an
 * answer separated from its points by a page boundary is a marking mistake, and
 * a row is the unit a marker reads in one go.
 */
function RowView({ row, theme }: { row: BaremRow; theme: Theme }) {
  const body = theme.typography.scale.body;
  const muted = resolveColor(theme, "textMuted");

  return (
    <article
      data-barem-row
      style={{
        paddingTop: mm(2.5),
        paddingBottom: mm(2.5),
        borderBottomStyle: "solid",
        borderBottomWidth: mm(theme.borders.hairlineMm),
        borderBottomColor: resolveColor(theme, "border"),
        fontSize: pt(body.sizePt),
        lineHeight: body.lineHeight,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: mm(2) }}>
        <span style={{ fontWeight: theme.typography.scale.h4.weight }}>
          {row.position}.
        </span>
        <span style={{ flex: "1 1 auto", minWidth: 0 }}>{row.name}</span>
        <span style={{ whiteSpace: "nowrap" }}>
          {BAREM_COPY.pointsLabel(row.points)}
        </span>
      </div>

      {row.prompt === "" ? null : (
        <p style={{ margin: 0, marginTop: mm(1), color: muted }}>
          {row.prompt}
        </p>
      )}

      <Field theme={theme} label={BAREM_COPY.answer}>
        {row.answered ? row.answer : BAREM_COPY.answerNotSet}
      </Field>

      {row.clarification === "" ? null : (
        <Field theme={theme} label={BAREM_COPY.clarification} quiet>
          {row.clarification}
        </Field>
      )}

      {row.note.length === 0 ? null : (
        <Field theme={theme} label={BAREM_COPY.note} quiet>
          <InlineView nodes={row.note} />
        </Field>
      )}
    </article>
  );
}

function Field({
  theme,
  label,
  quiet = false,
  children,
}: {
  theme: Theme;
  label: string;
  quiet?: boolean;
  children: ReactNode;
}) {
  const small = theme.typography.scale.small;

  return (
    <p
      style={{
        margin: 0,
        marginTop: mm(1),
        fontSize: quiet ? pt(small.sizePt) : undefined,
        lineHeight: quiet ? small.lineHeight : undefined,
        color: quiet ? resolveColor(theme, "textMuted") : undefined,
      }}
    >
      <span
        style={{
          color: resolveColor(theme, "textMuted"),
          fontSize: pt(small.sizePt),
        }}
      >
        {label}:{" "}
      </span>
      {children}
    </p>
  );
}
