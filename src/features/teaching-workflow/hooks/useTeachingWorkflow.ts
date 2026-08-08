import { useEffect, useMemo, useState } from "react";
import {
  buildWorkspaceInventory,
  type WorkspaceResourceItem,
} from "../../project-workspace/services/workspaceInventory";
import { wizardPath } from "../../universal-creation-wizard/constants";
import {
  FLOW_STEP_META,
  FLOW_STEPS,
  NEXT_ACTIONS,
  preferredSourceFor,
  type FlowStepKind,
} from "../constants";
import {
  teachingWorkflowStore,
  type TeachingWorkflowState,
} from "../services/teachingWorkflowStore";

export type WorkflowStepStatus = "completed" | "current" | "remaining";

export type WorkflowStepView = {
  kind: FlowStepKind;
  label: string;
  short: string;
  emoji: string;
  status: WorkflowStepStatus;
  count: number;
};

export type WhatsNextCard = {
  id: string;
  kind: FlowStepKind;
  title: string;
  detail: string;
  href: string;
  emoji: string;
};

type Prefill = {
  title?: string;
  subject?: string;
  grade?: string;
  sourceId?: string;
};

function countsByKind(inventory: WorkspaceResourceItem[]) {
  const map = Object.fromEntries(
    FLOW_STEPS.map((k) => [k, 0]),
  ) as Record<FlowStepKind, number>;
  for (const item of inventory) {
    if (item.kind in map) map[item.kind as FlowStepKind] += 1;
  }
  return map;
}

function buildNextCards(
  projectId: string,
  currentKind: FlowStepKind,
  inventory: WorkspaceResourceItem[],
  prefill: Prefill,
  dismissed: string[],
): WhatsNextCard[] {
  const counts = countsByKind(inventory);
  const targets = NEXT_ACTIONS[currentKind];
  return targets
    .filter((kind) => counts[kind] === 0)
    .map((kind) => {
      const meta = FLOW_STEP_META[kind];
      const source = preferredSourceFor(currentKind, kind);
      const id = `next-${currentKind}-to-${kind}`;
      return {
        id,
        kind,
        title: `Create ${meta.label}`,
        detail: `${FLOW_STEP_META[currentKind].label} is ready — continue the teaching flow with a ${meta.label.toLowerCase()}.`,
        emoji: meta.emoji,
        href: wizardPath({
          type: kind,
          projectId,
          source,
          sourceId: source !== "blank" ? prefill.sourceId : undefined,
          title: prefill.title
            ? `${prefill.title} — ${meta.label}`
            : undefined,
          subject: prefill.subject,
          grade: prefill.grade,
        }),
      };
    })
    .filter((c) => !dismissed.includes(c.id));
}

export function useTeachingWorkflow(input: {
  projectId: string;
  kind: FlowStepKind;
  resourceId: string;
  title?: string;
  subject?: string;
  grade?: string;
}) {
  const [state, setState] = useState<TeachingWorkflowState>(() =>
    teachingWorkflowStore.load(),
  );
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const next = teachingWorkflowStore.touch({
      projectId: input.projectId,
      kind: input.kind,
      resourceId: input.resourceId,
      markCompleted: true,
    });
    setState(next);
  }, [input.projectId, input.kind, input.resourceId]);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener("prima:artifacts-changed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("prima:artifacts-changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const inventory = useMemo(() => {
    void tick;
    return buildWorkspaceInventory(input.projectId);
  }, [input.projectId, tick]);

  useEffect(() => {
    const present = FLOW_STEPS.filter((k) =>
      inventory.some((i) => i.kind === k),
    );
    const next = teachingWorkflowStore.syncCompletedFromInventory(
      input.projectId,
      present,
    );
    setState(next);
  }, [inventory, input.projectId]);

  const counts = useMemo(() => countsByKind(inventory), [inventory]);

  const steps = useMemo<WorkflowStepView[]>(() => {
    return FLOW_STEPS.map((kind) => {
      const count = counts[kind];
      const completed =
        count > 0 || state.completedKinds.includes(kind);
      let status: WorkflowStepStatus = "remaining";
      if (kind === input.kind) status = "current";
      else if (completed) status = "completed";
      return {
        kind,
        label: FLOW_STEP_META[kind].label,
        short: FLOW_STEP_META[kind].short,
        emoji: FLOW_STEP_META[kind].emoji,
        status,
        count,
      };
    });
  }, [counts, input.kind, state.completedKinds]);

  const completedCount = steps.filter((s) => s.status === "completed").length;
  const remainingCount = steps.filter((s) => s.status === "remaining").length;
  const progressPercent = Math.round(
    (steps.filter((s) => s.status !== "remaining").length / FLOW_STEPS.length) *
      100,
  );

  const whatsNext = useMemo(
    () =>
      buildNextCards(
        input.projectId,
        input.kind,
        inventory,
        {
          title: input.title,
          subject: input.subject,
          grade: input.grade,
          sourceId: input.resourceId,
        },
        state.dismissedNextIds,
      ),
    [
      input.projectId,
      input.kind,
      input.title,
      input.subject,
      input.grade,
      input.resourceId,
      inventory,
      state.dismissedNextIds,
    ],
  );

  const dismissNext = (id: string) => {
    setState(teachingWorkflowStore.dismissNext(id));
  };

  return {
    steps,
    completedCount,
    remainingCount,
    progressPercent,
    whatsNext,
    dismissNext,
    inventory,
  };
}
