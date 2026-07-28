import type { AssetTypeDefinition, AssetTypeId, GeneratedAsset } from "../types";
import AssetCard from "./AssetCard";

type AssetCatalogProps = {
  definitions: AssetTypeDefinition[];
  assets: Record<AssetTypeId, GeneratedAsset>;
  selectedId: AssetTypeId | null;
  onSelect: (id: AssetTypeId) => void;
  onGenerate: (id: AssetTypeId) => void;
};

function AssetCatalog({
  definitions,
  assets,
  selectedId,
  onSelect,
  onGenerate,
}: AssetCatalogProps) {
  return (
    <aside
      className="rounded-3xl bg-[#F8F9FB] p-4 ring-1 ring-slate-200/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto"
      aria-label="Catalogul materialelor"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Catalog
      </p>
      <h2 className="mt-1 text-sm font-semibold text-slate-900">
        Materiale didactice
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        Se pregătesc doar din proiectul lecției confirmat.
      </p>
      <ul className="mt-4 space-y-3">
        {definitions.map((definition) => (
          <AssetCard
            key={definition.id}
            definition={definition}
            asset={assets[definition.id]}
            selected={selectedId === definition.id}
            onSelect={() => onSelect(definition.id)}
            onGenerate={() => onGenerate(definition.id)}
          />
        ))}
      </ul>
    </aside>
  );
}

export default AssetCatalog;
