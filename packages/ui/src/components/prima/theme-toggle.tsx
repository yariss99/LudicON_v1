import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import { useTheme, type ThemePreference } from "../../theme/theme-provider";
import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu";

/**
 * ADDITION, NOT A MANDATE.
 *
 * The design book specifies a dark theme (CH01 §4.6) but documents no switcher:
 * no placement, no control type, no Romanian label, no persistence rule. This
 * component is my judgement call, built to be easy to delete or move once the
 * question is actually answered.
 *
 * Three choices to keep, in order of how the reasoning goes: the OS default is
 * the honest default, so `Ca sistemul` exists and is what `system` means; the
 * two explicit choices exist because a teacher in a bright classroom may
 * override the OS for one device without changing the whole machine.
 *
 * It is deliberately quiet — an icon button in the header rather than a visible
 * segmented control — because CH02 Law 2 spends attention on the lesson, not on
 * appearance settings.
 */

interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
}

const OPTIONS: readonly ThemeOption[] = [
  { value: "light", label: "Luminos", icon: Sun },
  { value: "dark", label: "Întunecat", icon: Moon },
  { value: "system", label: "Ca sistemul", icon: Monitor },
];

export interface ThemeToggleProps {
  className?: string;
  /** Accessible name for the trigger. */
  label?: string;
}

export function ThemeToggle({
  className,
  label = "Aspectul interfeței",
}: ThemeToggleProps) {
  const { preference, resolved, setPreference } = useTheme();
  const TriggerIcon = resolved === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={label}
          className={className}
        >
          <TriggerIcon aria-hidden strokeWidth={1.75} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(next) => {
            // The provider owns validation; narrow here so the union survives.
            if (next === "light" || next === "dark" || next === "system")
              setPreference(next);
          }}
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon aria-hidden strokeWidth={1.75} />
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
