import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@ludicon/ui";

import { COPY } from "../copy";

/**
 * Move-up / move-down / remove, for any ordered child collection.
 *
 * CH07 requires a keyboard-reachable alternative to every drag gesture, so
 * these buttons are the primary reorder affordance rather than a fallback.
 */
export function ReorderControls({
  index,
  total,
  onMove,
  onRemove,
}: {
  index: number;
  total: number;
  onMove: (delta: number) => void;
  onRemove?: () => void;
}) {
  return (
    <>
      <IconButton
        label={COPY.moveUp}
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <ArrowUp aria-hidden size={18} strokeWidth={1.75} />
      </IconButton>
      <IconButton
        label={COPY.moveDown}
        disabled={index === total - 1}
        onClick={() => onMove(1)}
      >
        <ArrowDown aria-hidden size={18} strokeWidth={1.75} />
      </IconButton>
      {onRemove ? (
        <IconButton label={COPY.removeItem} onClick={onRemove}>
          <Trash2 aria-hidden size={18} strokeWidth={1.75} />
        </IconButton>
      ) : null}
    </>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="w-11 px-0"
    >
      {children}
    </Button>
  );
}

/** Immutable swap for any ordered array. */
export function moveItem<T>(
  items: readonly T[],
  index: number,
  delta: number,
): T[] {
  const next = [...items];
  const target = index + delta;
  const moved = next[index];
  const displaced = next[target];
  if (moved === undefined || displaced === undefined) return next;
  next[index] = displaced;
  next[target] = moved;
  return next;
}
