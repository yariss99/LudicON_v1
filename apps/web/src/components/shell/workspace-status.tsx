import { useCallback, useSyncExternalStore } from "react";
import { CloudOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, cn } from "@ludicon/ui";

/** Subscribes to the browser's own connectivity signal. */
function useOnline(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    globalThis.addEventListener("online", onChange);
    globalThis.addEventListener("offline", onChange);
    return () => {
      globalThis.removeEventListener("online", onChange);
      globalThis.removeEventListener("offline", onChange);
    };
  }, []);

  return useSyncExternalStore(
    subscribe,
    () => globalThis.navigator.onLine,
    () => true,
  );
}

export interface WorkspaceStatusProps {
  collapsed: boolean;
}

/**
 * The one thing about the workspace worth interrupting a teacher for.
 *
 * Silence is the resting state, and now it is the *only* resting state. This
 * also used to announce `Lucrezi pe acest dispozitiv` whenever the local
 * provider was configured — a sentence that never changed, never helped, and
 * sat permanently at the foot of the rail describing a situation in which
 * nothing was wrong. The owner called it noise and that is what it was: CH02
 * Law 2, and the design book's own "silence is often better than
 * interruption", applied to the component that was least obeying them.
 *
 * Offline is different, and it is the reason this component still exists. It is
 * the one moment a teacher genuinely needs telling, because the consequence —
 * work not reaching the workspace yet — is otherwise invisible. It is read from
 * the browser's own connectivity rather than hardcoded, so it cannot drift out
 * of step with reality, and it is carried by icon, wording and weight together
 * rather than by colour alone (CH07).
 *
 * It stays in the rail rather than moving into the floating dock, because the
 * dock does not exist below 900px — and a phone on a school corridor's wifi is
 * exactly where losing connectivity is most likely and least visible.
 */
export function WorkspaceStatus({ collapsed }: WorkspaceStatusProps) {
  const online = useOnline();

  if (online) return null;

  // The design book's own sentence, split at its em dash so the rail can set it
  // on two lines without rewording it.
  const headline = "Lucrezi offline";
  const detail = "modificările se vor sincroniza";
  const full = `${headline} — ${detail}.`;

  const body = (
    <div
      className={cn(
        "flex min-h-11 items-center rounded-full",
        collapsed
          ? "mx-auto w-11 justify-center px-0"
          : "gap-2.5 py-2 pr-3 pl-3.5",
      )}
    >
      <CloudOff
        aria-hidden
        strokeWidth={1.75}
        className="size-4 shrink-0 text-accent"
      />
      {collapsed ? (
        <span className="sr-only">{full}</span>
      ) : (
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[0.75rem] leading-[1.4] font-medium text-foreground">
            {headline}
          </span>
          <span className="truncate text-[0.75rem] leading-[1.4] text-muted-foreground">
            {detail}
          </span>
        </span>
      )}
    </div>
  );

  if (!collapsed) return body;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent side="right">{full}</TooltipContent>
    </Tooltip>
  );
}
