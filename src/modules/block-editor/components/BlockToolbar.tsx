type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  visible?: boolean;
};

export function BlockToolbar({
  collapsed,
  onToggleCollapse,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  visible = true,
}: Props) {
  return (
    <div
      className={[
        "flex flex-wrap items-center gap-0.5 transition",
        visible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
      ].join(" ")}
    >
      <button
        type="button"
        className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-30"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        title="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-30"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        title="Move down"
      >
        ↓
      </button>
      <button
        type="button"
        className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
        onClick={onToggleCollapse}
      >
        {collapsed ? "Expand" : "Collapse"}
      </button>
      <button
        type="button"
        className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
        onClick={onDuplicate}
      >
        Duplicate
      </button>
      <button
        type="button"
        className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
}
