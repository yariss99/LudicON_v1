import { Check, Info, TriangleAlert } from "lucide-react";
import {
  Toaster as SonnerToaster,
  toast,
  type ToasterProps as SonnerToasterProps,
} from "sonner";

import { useTheme } from "../theme/theme-provider";

export { toast };

export type ToasterProps = SonnerToasterProps;

/**
 * Transient confirmation.
 *
 * `unstyled` is on so sonner contributes behaviour and nothing else — every
 * colour below comes from the token layer, which is the whole point of the
 * refactor. Its default palette would reintroduce hardcoded greens and reds.
 *
 * Duration sits at 3.2s, inside CH03's 2.4–4s window, and `visibleToasts` is
 * capped at 3: "silence is often better than interruption" (CH02), and stacked
 * toasts are the loudest thing an interface can do.
 *
 * A toast confirms something that already happened. It never asks a question,
 * never carries the only copy of a message, and never delivers a PRIMA
 * suggestion — that is `FloatingSuggestion`.
 *
 * Must be rendered inside `<ThemeProvider>`; it follows the resolved theme so
 * sonner's own layer matches the app in dark mode.
 */
export function Toaster({
  position = "bottom-right",
  duration = 3200,
  visibleToasts = 3,
  gap = 12,
  offset = 24,
  ...props
}: ToasterProps) {
  const { resolved } = useTheme();

  return (
    <SonnerToaster
      theme={resolved}
      position={position}
      duration={duration}
      visibleToasts={visibleToasts}
      gap={gap}
      offset={offset}
      icons={{
        success: <Check aria-hidden strokeWidth={1.75} className="size-5" />,
        info: <Info aria-hidden strokeWidth={1.75} className="size-5" />,
        warning: (
          <TriangleAlert aria-hidden strokeWidth={1.75} className="size-5" />
        ),
        error: (
          <TriangleAlert aria-hidden strokeWidth={1.75} className="size-5" />
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: [
            "flex w-full items-start gap-3 rounded-md bg-surface p-4",
            "text-surface-foreground shadow-hover ring-1 ring-border",
          ].join(" "),
          content: "flex min-w-0 flex-col gap-1",
          title: "text-base font-semibold leading-[1.4] text-strong",
          description: "text-base leading-[1.55] text-muted-foreground",
          icon: "mt-0.5 shrink-0",
          // State is icon + words + hue together, never hue alone (CH07).
          success: "[&_[data-icon]]:text-success",
          info: "[&_[data-icon]]:text-info",
          warning: "[&_[data-icon]]:text-warning",
          error: "[&_[data-icon]]:text-destructive",
          actionButton: [
            "ml-auto inline-flex min-h-11 shrink-0 items-center rounded-full bg-primary px-4",
            "text-base font-medium text-primary-foreground",
          ].join(" "),
          cancelButton: [
            "inline-flex min-h-11 shrink-0 items-center rounded-full px-4",
            "text-base font-medium text-muted-foreground hover:bg-muted",
          ].join(" "),
          closeButton:
            "rounded-full bg-surface text-muted-foreground ring-1 ring-border",
        },
      }}
      {...props}
    />
  );
}
