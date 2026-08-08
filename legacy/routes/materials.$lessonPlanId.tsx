import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";
import {
  canGenerateMaterials,
  isApproved,
  plannedKinds,
  type Project,
} from "@ludicon/domain";
import { Button, EmptyState, PrimaMark, Skeleton, toast } from "@ludicon/ui";

import { repositories } from "../lib/data";
import { listDocumentsForProject } from "../lib/documents";
import { isBuilderKind, type BuilderKind } from "../features/builder/types";
import { MATERIALS_COPY } from "../features/materials/copy";
import { MaterialPicker } from "../features/materials/MaterialPicker";
import { prepareMaterials } from "../features/materials/prepare-materials";
import { PreparedList } from "../features/materials/PreparedList";
import { teacherOnly } from "../auth/session";

export const Route = createFileRoute("/materials/$lessonPlanId")({
  beforeLoad: teacherOnly,
  component: MaterialsPage,
});

/**
 * Material preparation — `Pregătirea materialelor`.
 *
 * The approval gate lives here too, not as a disabled button but as a whole
 * screen: when the lesson has not been approved, this page does not render a
 * picker at all. Teacher Authority is the product's constitutional rule — a
 * material that appears before the teacher said the design was right is a
 * material the teacher never asked for.
 */
function MaterialsPage() {
  const { lessonPlanId } = Route.useParams();
  const queryClient = useQueryClient();

  const planQuery = useQuery({
    queryKey: queryKeys.lessonPlans.detail(lessonPlanId),
    queryFn: () => repositories.lessonPlans.get(lessonPlanId),
  });

  const plan = planQuery.data ?? null;

  const projectQuery = useQuery({
    queryKey: queryKeys.projects.detail(plan?.projectId ?? ""),
    queryFn: () =>
      plan === null ? null : repositories.projects.get(plan.projectId),
    enabled: plan !== null,
  });

  const project = projectQuery.data ?? null;

  const documentsQuery = useQuery({
    queryKey: queryKeys.documents.list(plan?.projectId ?? ""),
    queryFn: () =>
      plan === null ? [] : listDocumentsForProject(plan.projectId),
    enabled: plan !== null,
  });

  // Seeded from the project's own plan, so the choice made at intent capture
  // is already ticked and a teacher who leaves and returns finds it waiting.
  const [chosen, setChosen] = useState<ReadonlySet<BuilderKind> | null>(null);

  const prepare = useMutation({
    mutationFn: prepareMaterials,
    onSuccess: async (created) => {
      setChosen(new Set());
      await queryClient.invalidateQueries({
        queryKey: queryKeys.documents.all(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.resources.all(),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(),
      });
      toast.success(
        created.length === 1
          ? MATERIALS_COPY.preparedOne
          : MATERIALS_COPY.preparedMany(created.length),
      );
    },
    onError: () => toast.error(MATERIALS_COPY.prepareFailed),
  });

  if (planQuery.isPending || projectQuery.isPending) {
    return (
      <Shell>
        <MaterialsSkeleton />
      </Shell>
    );
  }

  if (planQuery.isError || projectQuery.isError) {
    return (
      <Shell>
        <EmptyState
          title={MATERIALS_COPY.failedTitle}
          explanation={MATERIALS_COPY.failedExplanation}
        />
      </Shell>
    );
  }

  if (plan === null || project === null) {
    return (
      <Shell>
        <EmptyState
          title={MATERIALS_COPY.missingTitle}
          explanation={MATERIALS_COPY.missingExplanation}
          action={
            <Button variant="primary" asChild>
              <Link to="/projects">{MATERIALS_COPY.toProjects}</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  // ---- The gate. Both halves must agree before anything can be produced. ----
  if (!isApproved(plan) || !canGenerateMaterials(project.state)) {
    return (
      <Shell subtitle={plan.title}>
        <EmptyState
          title={MATERIALS_COPY.gateTitle}
          explanation={MATERIALS_COPY.gateExplanation}
          action={
            <Button variant="primary" asChild>
              <Link
                to="/design/$lessonPlanId"
                params={{ lessonPlanId: plan.id }}
              >
                {MATERIALS_COPY.gateAction}
              </Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  const prepared = documentsQuery.data ?? [];
  const alreadyMade = new Set<string>(prepared.map((entry) => entry.kind));
  const selection = chosen ?? intendedSelection(project, alreadyMade);

  const toggle = (kind: BuilderKind) => {
    const next = new Set(selection);
    if (next.has(kind)) next.delete(kind);
    else next.add(kind);
    setChosen(next);
  };

  return (
    <Shell subtitle={plan.title}>
      <MaterialPicker
        chosen={selection}
        prepared={alreadyMade}
        busy={prepare.isPending}
        onToggle={toggle}
        onPrepare={() =>
          prepare.mutate({ plan, project, kinds: [...selection] })
        }
      />
      <PreparedList projectId={project.id} documents={prepared} />
    </Shell>
  );
}

/** What the teacher already said they wanted, minus what is already made. */
function intendedSelection(
  project: Project,
  made: ReadonlySet<string>,
): ReadonlySet<BuilderKind> {
  return new Set(
    plannedKinds(project).filter(
      (kind): kind is BuilderKind => isBuilderKind(kind) && !made.has(kind),
    ),
  );
}

interface ShellProps {
  subtitle?: string;
  children: ReactNode;
}

/** Full-bleed frame shared by every state of this surface. */
function Shell({ subtitle, children }: ShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-6"
        role="banner"
      >
        <Link
          to="/"
          className="flex min-h-11 items-center gap-2"
          aria-label="PRIMA — Biroul meu"
        >
          <PrimaMark size={20} />
          <span className="font-display font-semibold text-foreground">
            PRIMA
          </span>
        </Link>
        {subtitle ? (
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </header>

      <main id="continut" className="flex-1 px-6 py-10" role="main">
        <div className="reading-column">
          <h1 className="mb-8 font-display text-2xl font-semibold text-foreground">
            {MATERIALS_COPY.pageTitle}
          </h1>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Matches the picker grid, so nothing moves when the real list arrives. */
function MaterialsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-64" />
      <div className="grid gap-3 tablet:grid-cols-2">
        {Array.from({ length: 6 }, (_unused, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {MATERIALS_COPY.loading}
      </p>
    </div>
  );
}
