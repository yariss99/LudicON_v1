import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, cn } from "@ludicon/ui";

export interface CreateButtonProps {
  collapsed: boolean;
  /** Fires after the choice, so the mobile drawer can close behind it. */
  onNavigate?: () => void;
}

/**
 * The rail's one action, and the only filled primary in the chrome.
 *
 * It used to be a menu of six things a teacher could start — a lesson, a
 * worksheet, an assessment, a story, a game, a presentation. There is one kind
 * of project now, so a dropdown offering a single item would be a gesture that
 * asks a question with one answer. It is a link.
 *
 * The `+` deliberately has no chip behind it. A filled chip inside a filled
 * pill of the same colour is a disc drawn on itself; on a blue pill the glyph
 * simply is the colour, and the shape stays one object rather than two.
 *
 * Chrome that persists across every screen has the better claim on the accent
 * than a control that appears on one, which is why this stays solid `--primary`
 * while each page's own call to action steps down.
 */
export function CreateButton({ collapsed, onNavigate }: CreateButtonProps) {
  const link = (
    <Link
      to="/create"
      onClick={onNavigate}
      className={cn(
        "flex cursor-pointer items-center rounded-full",
        "bg-primary text-primary-foreground shadow-soft",
        "transition-[box-shadow,background-color] duration-[var(--motion-fast)] ease-standard",
        "hover:bg-primary-hover hover:shadow-hover",
        collapsed
          ? "size-12 shrink-0 justify-center"
          : "min-h-12 w-full gap-2.5 px-4",
      )}
    >
      <Plus aria-hidden strokeWidth={2} className="size-5 shrink-0" />
      {collapsed ? (
        <span className="sr-only">Creează un proiect</span>
      ) : (
        <span className="flex-1 text-left text-base font-semibold">
          Creează un proiect
        </span>
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">Creează un proiect</TooltipContent>
    </Tooltip>
  );
}
