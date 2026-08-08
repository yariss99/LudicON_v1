import { forwardRef, useState, type ButtonHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "value" | "type"
> {
  /** Controlled state. Leave undefined to let the switch manage its own. */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * On/off switch for settings that apply immediately.
 *
 * Built as a `role="switch"` button rather than a Radix primitive:
 * `@radix-ui/react-switch` is not among the declared dependencies. The ARIA
 * switch pattern is small enough to implement exactly — `aria-checked`, Space
 * and Enter (both native on a button), and a visible focus ring.
 *
 * State reads three ways: thumb position, track fill, and `aria-checked`. Use
 * it only where the change is instant; anything needing confirmation is a
 * checkbox plus an explicit action.
 */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  function Switch(
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) {
    const [internal, setInternal] = useState(defaultChecked);
    const isControlled = checked !== undefined;
    const isOn = isControlled ? checked : internal;

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isOn}
        disabled={disabled}
        data-state={isOn ? "checked" : "unchecked"}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (!isControlled) setInternal(!isOn);
          onCheckedChange?.(!isOn);
        }}
        className={cn(
          "inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full",
          "disabled:pointer-events-none disabled:opacity-55",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className={cn(
            "relative flex h-6 w-11 items-center rounded-full",
            "transition-colors duration-[var(--motion-fast)] ease-standard",
            isOn ? "bg-primary" : "bg-muted ring-1 ring-border",
          )}
        >
          <span
            className={cn(
              "size-5 rounded-full bg-surface shadow-soft",
              "transition-transform duration-[var(--motion-fast)] ease-standard",
              isOn ? "translate-x-[1.375rem]" : "translate-x-0.5",
            )}
          />
        </span>
      </button>
    );
  },
);
