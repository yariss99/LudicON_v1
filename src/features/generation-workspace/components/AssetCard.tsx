import {
  BookOpen,
  CheckSquare,
  Eye,
  FileText,
  Gamepad2,
  Home,
  Image,
  ListChecks,
  Mail,
  NotebookPen,
  Presentation,
  ScrollText,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ASSET_STATUS_LABEL } from "../constants";
import type { AssetTypeDefinition, GeneratedAsset } from "../types";

const ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  file: FileText,
  check: CheckSquare,
  presentation: Presentation,
  game: Gamepad2,
  story: ScrollText,
  image: Image,
  home: Home,
  rubric: ListChecks,
  eye: Eye,
  mail: Mail,
  users: Users,
  notes: NotebookPen,
};

type AssetCardProps = {
  definition: AssetTypeDefinition;
  asset: GeneratedAsset;
  selected: boolean;
  onSelect: () => void;
  onGenerate: () => void;
};

function AssetCard({
  definition,
  asset,
  selected,
  onSelect,
  onGenerate,
}: AssetCardProps) {
  const Icon = ICONS[definition.icon] ?? FileText;
  const version = asset.versions.find((v) => v.id === asset.currentVersionId);
  const status =
    asset.outdated || asset.status === "needs_update"
      ? "needs_update"
      : asset.status;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={[
          "flex w-full flex-col rounded-2xl px-3 py-3 text-left transition-colors ring-1",
          selected
            ? "bg-slate-900 text-white ring-slate-900"
            : "bg-white text-slate-800 ring-slate-200/80 hover:bg-slate-50",
        ].join(" ")}
      >
        <div className="flex items-start gap-2.5">
          <span
            className={[
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
              selected ? "bg-white/10" : "bg-slate-50",
            ].join(" ")}
          >
            <Icon size={15} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{definition.title}</p>
            <p
              className={[
                "mt-0.5 text-[11px] leading-relaxed",
                selected ? "text-slate-300" : "text-slate-500",
              ].join(" ")}
            >
              {definition.description}
            </p>
          </div>
        </div>
        <div
          className={[
            "mt-2 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide",
            selected ? "text-slate-300" : "text-slate-400",
          ].join(" ")}
        >
          <span>{ASSET_STATUS_LABEL[status]}</span>
          {version ? <span>· {version.versionLabel}</span> : null}
          {asset.lastGeneratedAt ? (
            <span>
              · {new Date(asset.lastGeneratedAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>
      </button>
      <button
        type="button"
        onClick={onGenerate}
        className="mt-1.5 w-full rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
      >
        {asset.status === "not_generated" || asset.status === "failed"
          ? "Creează materialele"
          : "Pregătește din nou"}
      </button>
    </li>
  );
}

export default AssetCard;
