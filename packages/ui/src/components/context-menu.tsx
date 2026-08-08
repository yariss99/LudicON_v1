import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { cn } from "../lib/cn";

type Point = { x: number; y: number };

interface ContextMenuContextValue {
  point: Point;
  openAt: (point: Point) => void;
  triggerRef: RefObject<HTMLDivElement | null>;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext(component: string): ContextMenuContextValue {
  const context = useContext(ContextMenuContext);
  if (!context)
    throw new Error(`${component} must be used inside <ContextMenu>`);
  return context;
}

export interface ContextMenuProps {
  children: ReactNode;
  /** Trap the page behind the menu. Off by default — a context menu is a shortcut, not a mode. */
  modal?: boolean;
}

/**
 * Right-click menu.
 *
 * Composed from `@radix-ui/react-dropdown-menu` anchored to a zero-size element
 * placed at the pointer, because `@radix-ui/react-context-menu` is not among
 * the declared dependencies. Everything CH07 asks for still comes from Radix:
 * roving focus, typeahead, Escape to close, and no keyboard trap.
 *
 * The keyboard path is real, not theoretical — Shift+F10 and the Menu key both
 * fire `contextmenu`, and when they do the event carries no useful coordinates,
 * so the menu anchors to the element instead of to the top-left of the screen.
 * Every gesture needs a keyboard equivalent (CH08).
 */
export function ContextMenu({ children, modal = false }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const openAt = useCallback((next: Point) => {
    setPoint(next);
    setOpen(true);
  }, []);

  const value = useMemo<ContextMenuContextValue>(
    () => ({ point, openAt, triggerRef }),
    [point, openAt],
  );

  return (
    <ContextMenuContext.Provider value={value}>
      <DropdownMenuPrimitive.Root
        open={open}
        onOpenChange={setOpen}
        modal={modal}
      >
        {children}
        <DropdownMenuPrimitive.Trigger
          aria-hidden
          tabIndex={-1}
          className="pointer-events-none fixed size-0 opacity-0"
          style={{ left: point.x, top: point.y }}
        />
      </DropdownMenuPrimitive.Root>
    </ContextMenuContext.Provider>
  );
}

export type ContextMenuTriggerProps = HTMLAttributes<HTMLDivElement>;

export function ContextMenuTrigger({
  className,
  onContextMenu,
  ...props
}: ContextMenuTriggerProps) {
  const { openAt, triggerRef } = useContextMenuContext("ContextMenuTrigger");

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    onContextMenu?.(event);
    if (event.defaultPrevented) return;
    event.preventDefault();

    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    const rect = event.currentTarget.getBoundingClientRect();
    openAt(
      fromKeyboard
        ? { x: rect.left + 8, y: rect.top + rect.height / 2 }
        : { x: event.clientX, y: event.clientY },
    );
  };

  return (
    <div
      ref={triggerRef}
      tabIndex={-1}
      className={className}
      onContextMenu={handleContextMenu}
      {...props}
    />
  );
}

export type ContextMenuContentProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
>;

export const ContextMenuContent = forwardRef<
  ComponentRef<typeof DropdownMenuPrimitive.Content>,
  ContextMenuContentProps
>(function ContextMenuContent(
  { className, align = "start", sideOffset = 2, ...props },
  ref,
) {
  const { triggerRef } = useContextMenuContext("ContextMenuContent");

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        // Radix would return focus to the invisible anchor. Send it back to the
        // element the teacher actually right-clicked, so nothing is "lost".
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        className={cn(
          "z-50 min-w-56 overflow-hidden rounded-md bg-popover p-1.5",
          "text-popover-foreground shadow-hover ring-1 ring-border",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export {
  DropdownMenuItem as ContextMenuItem,
  DropdownMenuLabel as ContextMenuLabel,
  DropdownMenuSeparator as ContextMenuSeparator,
  DropdownMenuShortcut as ContextMenuShortcut,
  DropdownMenuGroup as ContextMenuGroup,
} from "./dropdown-menu";
