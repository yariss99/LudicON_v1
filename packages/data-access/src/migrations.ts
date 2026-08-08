import { ASSET_KIND_LABEL, AssetKind } from "@ludicon/domain";

/** The shape every collection is stored in, whatever version it is at. */
export type StoredEnvelope = {
  version: number;
  records: Record<string, unknown>;
};

/**
 * One step forward for one collection.
 *
 * Migrations receive the collection name because the stored shape differs per
 * collection — a rule that applies to `projects` must not silently run over
 * `resources`. The previous signature omitted it, which meant a real migration
 * could never have been written against it.
 */
export type Migration = (
  collection: string,
  records: Record<string, unknown>,
) => Record<string, unknown>;

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : null;

const mapRecords = (
  records: Record<string, unknown>,
  step: (record: Record<string, unknown>) => Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(records).map(([id, raw]) => {
      const record = asRecord(raw);
      return [id, record === null ? raw : step(record)];
    }),
  );

/**
 * Titles used to carry their kind as a prefix — `"Fișă de lucru: Fracții"`.
 * Reading it back is how an existing project keeps the kind it always had once
 * the kind becomes a field of its own.
 */
const KIND_PREFIXES: readonly (readonly [AssetKind, string])[] =
  AssetKind.options.map((kind) => [kind, `${ASSET_KIND_LABEL[kind]}: `]);

function readKindFromTitle(title: string): {
  kind: AssetKind;
  title: string;
} {
  for (const [kind, prefix] of KIND_PREFIXES) {
    if (title.startsWith(prefix)) {
      const rest = title.slice(prefix.length).trim();
      return rest.length > 0
        ? { kind, title: rest }
        : { kind, title: ASSET_KIND_LABEL[kind] };
    }
  }
  return { kind: "lesson_plan", title };
}

/**
 * 1 -> 2. The material kind stops being a substring of the title, approval
 * gains an author, and a library entry learns which document it stands for.
 */
const toVersion2: Migration = (collection, records) => {
  if (collection === "projects") {
    return mapRecords(records, (project) => {
      const stored = project["title"];
      const read = readKindFromTitle(typeof stored === "string" ? stored : "");
      const kind =
        AssetKind.safeParse(project["intendedKind"]).data ?? read.kind;

      return {
        ...project,
        title: read.title,
        intendedKind: kind,
        plannedMaterials:
          project["plannedMaterials"] ??
          (kind === "lesson_plan" ? [] : [{ kind, selected: true }]),
        archivedAt: project["archivedAt"] ?? null,
      };
    });
  }

  if (collection === "lesson-plans") {
    return mapRecords(records, (plan) => ({
      ...plan,
      approvedBy: plan["approvedBy"] ?? null,
      approvalNote: plan["approvalNote"] ?? null,
    }));
  }

  if (collection === "resources") {
    return mapRecords(records, (resource) => ({
      ...resource,
      documentId: resource["documentId"] ?? null,
    }));
  }

  return records;
};

/**
 * Keyed by the version being migrated *from*.
 *
 * Registering a step here is what makes a schema change safe for teachers who
 * already have work on this device.
 */
export const MIGRATIONS: Readonly<Record<number, Migration>> = Object.freeze({
  1: toVersion2,
});
