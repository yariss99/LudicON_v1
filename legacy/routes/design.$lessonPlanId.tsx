import { useCallback, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";
import {
  BlockId,
  isApproved,
  LESSON_SECTION_LABEL,
  type LessonPlan,
  type LessonSectionId,
  type PedagogicalBlock,
} from "@ludicon/domain";
import { Button, EmptyState, PrimaMark, Skeleton, toast } from "@ludicon/ui";

import { MATERIALS_COPY } from "../features/materials/copy";
import { ApprovalGate } from "../features/design-studio/approval-gate";
import { approveDesign } from "../features/design-studio/approve-design";
import {
  DesignCanvas,
  sectionDomId,
} from "../features/design-studio/design-canvas";
import { LessonNavigator } from "../features/design-studio/lesson-navigator";
import { PrimaPanel } from "../features/design-studio/prima-panel";
import {
  isReadyForMaterials,
  makeBlock,
  moveBlock,
  sectionsStillNeeded,
  withBlock,
} from "../features/design-studio/lesson-analysis";
import {
  recommendationsFor,
  type Recommendation,
} from "../features/design-studio/recommendations";
import {
  SAVE_STATUS_LABEL,
  useLessonDesign,
} from "../features/design-studio/use-lesson-design";
import { teacherOnly } from "../auth/session";

export const Route = createFileRoute("/design/$lessonPlanId")({
  beforeLoad: teacherOnly,
  component: LessonDesignStudio,
});

/** CH12: a navigator click highlights the target for 400ms, then lets go. */
const HIGHLIGHT_MS = 400;

/**
 * Lesson Design Studio — where the lesson is actually made.
 *
 * Full viewport, three columns: structure on the left, the lesson in the
 * middle, PRIMA on the right. The centre column is always the widest, and the
 * PRIMA rail is never wider than it (CH02 zone rules). Nothing here opens a
 * dialog over the teacher's work.
 */
function LessonDesignStudio() {
  const { lessonPlanId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const design = useLessonDesign(lessonPlanId);

  const [activeSection, setActiveSection] =
    useState<LessonSectionId>("general");
  const [highlighted, setHighlighted] = useState<LessonSectionId | null>(null);
  const [navigatorCollapsed, setNavigatorCollapsed] = useState(false);
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(new Set());
  const [approving, setApproving] = useState(false);

  const selectSection = useCallback((section: LessonSectionId) => {
    setActiveSection(section);
    setHighlighted(section);
    document
      .getElementById(sectionDomId(section))
      ?.scrollIntoView({ block: "start" });
    setTimeout(() => setHighlighted(null), HIGHLIGHT_MS);
  }, []);

  const { plan, update } = design;

  const handleApply = useCallback(
    (recommendation: Recommendation) => {
      update(recommendation.apply);
      toast.success(recommendation.confirmation);
    },
    [update],
  );

  const handleDismiss = useCallback((id: string) => {
    setDismissed((current) => new Set(current).add(id));
  }, []);

  const openMaterials = useCallback(
    (lessonPlan: LessonPlan) =>
      navigate({
        to: "/materials/$lessonPlanId",
        params: { lessonPlanId: lessonPlan.id },
      }),
    [navigate],
  );

  /**
   * The approval gate, from the teacher's side.
   *
   * Nothing is written until the teacher confirms inside the dialog. The plan
   * and the project move together, in one unit of work, so the design can never
   * say "approved" while the project still says "in design".
   */
  const approve = useCallback(
    async (note: string) => {
      if (!plan) return;
      setApproving(true);
      try {
        // Commit whatever is still on screen before the gate reads the plan,
        // so approval covers exactly what the teacher is looking at.
        const current = await design.saveNow(plan);
        const result = await approveDesign({
          plan: current,
          projectId: current.projectId,
          note,
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all(),
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.lessonPlans.all(),
        });
        toast.success(MATERIALS_COPY.approved);
        await openMaterials(result.plan);
      } catch {
        toast.error(MATERIALS_COPY.approveFailed);
      } finally {
        setApproving(false);
      }
    },
    [plan, design, queryClient, openMaterials],
  );

  if (design.isPending) return <StudioSkeleton />;

  if (design.isError) {
    return (
      <StudioMessage
        title="Nu am putut deschide lecția acum"
        explanation="Ce ai lucrat este în siguranță. Încearcă din nou peste câteva momente."
      />
    );
  }

  if (design.isMissing || plan === null) {
    return (
      <StudioMessage
        title="Lecția aceasta nu se mai află aici"
        explanation="Poate a fost mutată sau linkul e vechi. Proiectele tale te așteaptă la locul lor."
      />
    );
  }

  const ready = isReadyForMaterials(plan);
  const remaining = sectionsStillNeeded(plan);
  const recommendations = recommendationsFor(plan, dismissed);

  const editBlock = (block: PedagogicalBlock) =>
    update((current) => withBlock(current, block));

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header
        className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface px-4"
        role="banner"
      >
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2"
          aria-label="PRIMA — Biroul meu"
        >
          <PrimaMark size={20} />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold text-foreground">
            {plan.title}
          </h1>
          <p className="truncate text-[0.75rem] text-muted-foreground">
            {plan.subject} · {plan.grade} · {plan.durationMinutes} de minute
          </p>
        </div>

        <p
          role="status"
          aria-live="polite"
          className="shrink-0 text-[0.8125rem] text-muted-foreground"
        >
          {SAVE_STATUS_LABEL[design.status]}
        </p>

        <ApprovalGate
          plan={plan}
          ready={ready}
          busy={approving}
          hintId="poarta-materiale"
          onApprove={(note) => void approve(note)}
          onContinue={() => void openMaterials(plan)}
        />
      </header>

      {ready || isApproved(plan) ? null : (
        <p
          id="poarta-materiale"
          className="shrink-0 border-b border-border bg-accent-soft px-4 py-2 text-[0.8125rem] text-foreground"
        >
          {MATERIALS_COPY.notReadyLead}{" "}
          {remaining.map((section) => LESSON_SECTION_LABEL[section]).join(", ")}
          .
        </p>
      )}

      <div id="continut" className="flex min-h-0 flex-1" role="main">
        <LessonNavigator
          plan={plan}
          activeSection={activeSection}
          onSelect={selectSection}
          collapsed={navigatorCollapsed}
          onToggleCollapsed={() => setNavigatorCollapsed((open) => !open)}
        />

        <DesignCanvas
          plan={plan}
          highlighted={highlighted}
          onBlockChange={editBlock}
          onBlockMove={(blockId, direction) =>
            update((current) => moveBlock(current, blockId, direction))
          }
          onBlockDuplicate={(block) =>
            update((current) => ({
              ...current,
              blocks: [
                ...current.blocks,
                {
                  ...block,
                  id: BlockId.parse(crypto.randomUUID()),
                  title: `${block.title} (copie)`,
                  order: block.order + 1,
                },
              ],
            }))
          }
          onBlockRemove={(blockId) =>
            update((current) => ({
              ...current,
              blocks: current.blocks.filter((block) => block.id !== blockId),
            }))
          }
          onAddBlock={(section) =>
            update((current: LessonPlan) => ({
              ...current,
              blocks: [
                ...current.blocks,
                makeBlock(current, section, LESSON_SECTION_LABEL[section]),
              ],
            }))
          }
        />

        <PrimaPanel
          plan={plan}
          recommendations={recommendations}
          onApply={handleApply}
          onDismiss={handleDismiss}
        />
      </div>
    </div>
  );
}

/** Mirrors the three-column shell so nothing shifts when the lesson lands. */
function StudioSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-4">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="h-5 w-56" />
        <div className="flex-1" />
        <Skeleton className="h-11 w-44 rounded-full" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-64 shrink-0 border-r border-border p-4">
          <Skeleton className="mb-4 h-4 w-24" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 9 }, (_unused, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-studio-canvas p-10">
          <div className="block-measure flex flex-col gap-6">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </div>
        <div className="hidden w-[22rem] shrink-0 border-l border-border p-5 laptop:block">
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        Se încarcă…
      </p>
    </div>
  );
}

interface StudioMessageProps {
  title: string;
  explanation: string;
}

/** A calm full-screen state. Never blames, always offers the way back. */
function StudioMessage({ title, explanation }: StudioMessageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <EmptyState
        className="max-w-[36rem]"
        title={title}
        explanation={explanation}
        action={
          <Button variant="primary" asChild>
            <Link to="/projects">Vezi proiectele</Link>
          </Button>
        }
      />
    </div>
  );
}
