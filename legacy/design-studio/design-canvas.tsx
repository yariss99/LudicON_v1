import { Plus } from "lucide-react";
import {
  blocksForSection,
  LESSON_SECTION_LABEL,
  LESSON_SECTION_ORDER,
  type LessonPlan,
  type LessonSectionId,
  type PedagogicalBlock,
} from "@ludicon/domain";
import { Button, cn } from "@ludicon/ui";

import { PedagogicalBlockCard } from "./pedagogical-block-card";

/** DOM id a navigator click scrolls to. One rule, one place. */
export const sectionDomId = (section: LessonSectionId): string =>
  `sectiune-${section}`;

/**
 * What "add" means in each section, in the teacher's words.
 *
 * UX-001's canonical verbs are `Adaugă activitate`, `Adaugă evaluare`,
 * `Adaugă resursă` and `Adaugă secțiune`; the rest are written in the same
 * register rather than falling back to a generic "Adaugă element".
 */
const ADD_LABEL: Readonly<Record<LessonSectionId, string>> = Object.freeze({
  general: "Adaugă o informație",
  competencies: "Adaugă o competență",
  objectives: "Adaugă un obiectiv",
  sequence: "Adaugă un moment",
  activities: "Adaugă activitate",
  resources: "Adaugă resursă",
  assessment: "Adaugă evaluare",
  reflection: "Adaugă o reflecție",
  publication: "Adaugă o notă de publicare",
});

const EMPTY_LINE: Readonly<Record<LessonSectionId, string>> = Object.freeze({
  general: "Contextul clasei și al disciplinei se scrie aici.",
  competencies: "Competențele pe care lecția le pune în lucru.",
  objectives: "Ce vor ști sau vor putea face elevii la final.",
  sequence: "Momentele lecției, în ordinea în care se petrec.",
  activities: "Ce fac efectiv copiii în timpul lecției.",
  resources: "Materialele de care ai nevoie la clasă.",
  assessment: "Cum vei observa ce au învățat.",
  reflection: "Ce vrei să reții după ce lecția s-a încheiat.",
  publication: "Ce pregătești pentru colegi sau pentru părinți.",
});

export interface DesignCanvasProps {
  plan: LessonPlan;
  /** Section highlighted after a navigator click; cleared by the parent. */
  highlighted: LessonSectionId | null;
  onBlockChange: (block: PedagogicalBlock) => void;
  onBlockMove: (blockId: PedagogicalBlock["id"], direction: -1 | 1) => void;
  onBlockDuplicate: (block: PedagogicalBlock) => void;
  onBlockRemove: (blockId: PedagogicalBlock["id"]) => void;
  onAddBlock: (section: LessonSectionId) => void;
}

/**
 * The lesson itself.
 *
 * Blocks are capped at the 720px measure (`block-measure`) and centred on the
 * warm studio canvas, so the writing surface reads like paper rather than like
 * a dashboard. All nine sections are always present: a section the teacher has
 * not reached yet is empty, never hidden, because hiding it would make the
 * shape of a lesson a thing you discover by accident.
 *
 * Smooth scrolling is declared in CSS rather than passed to `scrollIntoView`,
 * so `motion-reduce:scroll-auto` can switch it off without a second code path.
 */
export function DesignCanvas({
  plan,
  highlighted,
  onBlockChange,
  onBlockMove,
  onBlockDuplicate,
  onBlockRemove,
  onAddBlock,
}: DesignCanvasProps) {
  return (
    <div className="h-full flex-1 overflow-y-auto bg-studio-canvas scroll-smooth motion-reduce:scroll-auto">
      <div className="block-measure flex flex-col gap-12 px-6 py-10">
        {LESSON_SECTION_ORDER.map((section) => {
          const blocks = blocksForSection(plan, section);
          const isHighlighted = highlighted === section;

          return (
            <section
              key={section}
              id={sectionDomId(section)}
              aria-labelledby={`${sectionDomId(section)}-titlu`}
              className={cn(
                "scroll-mt-6 rounded-lg transition-shadow duration-[var(--motion-standard)] ease-standard",
                isHighlighted &&
                  "ring-2 ring-primary ring-offset-4 ring-offset-studio-canvas",
              )}
            >
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                <h2
                  id={`${sectionDomId(section)}-titlu`}
                  className="font-display text-xl font-semibold text-foreground"
                >
                  {LESSON_SECTION_LABEL[section]}
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAddBlock(section)}
                >
                  <Plus aria-hidden strokeWidth={1.75} />
                  {ADD_LABEL[section]}
                </Button>
              </div>

              {blocks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
                  {EMPTY_LINE[section]}
                  <br />
                  Poți completa această secțiune acum sau mai târziu.
                </p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {blocks.map((block, index) => (
                    <li key={block.id}>
                      <PedagogicalBlockCard
                        block={block}
                        index={index}
                        total={blocks.length}
                        onChange={onBlockChange}
                        onMove={(direction) => onBlockMove(block.id, direction)}
                        onDuplicate={() => onBlockDuplicate(block)}
                        onRemove={() => onBlockRemove(block.id)}
                      />
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
