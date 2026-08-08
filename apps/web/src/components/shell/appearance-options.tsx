import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  useTheme,
  type ThemePreference,
} from "@ludicon/ui";

interface AppearanceOption {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
}

const OPTIONS: readonly AppearanceOption[] = [
  { value: "light", label: "Luminos", icon: Sun },
  { value: "dark", label: "Întunecat", icon: Moon },
  { value: "system", label: "Ca sistemul", icon: Monitor },
];

/** The icon that stands for "appearance" right now — what you are looking at. */
export function useAppearanceIcon(): LucideIcon {
  const { resolved } = useTheme();
  return resolved === "dark" ? Moon : Sun;
}

/**
 * The three appearance choices, as menu rows.
 *
 * The design system ships these as a self-contained header dropdown, and its
 * own docblock calls it "an addition, not a mandate — built to be easy to
 * delete or move once the question is actually answered". This is that move:
 * the choices are unchanged and the labels are unchanged, but they stop
 * occupying a permanent slot in the header beside the notification bell and
 * take their place under the account instead.
 *
 * Split out rather than inlined so the two auth branches can present the same
 * three options without either one owning them.
 */
export function AppearanceOptions() {
  const { preference, setPreference } = useTheme();

  return (
    <DropdownMenuRadioGroup
      value={preference}
      onValueChange={(next) => {
        // The provider owns validation; narrow here so the union survives.
        if (next === "light" || next === "dark" || next === "system") {
          setPreference(next);
        }
      }}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <DropdownMenuRadioItem
            key={option.value}
            value={option.value}
            className="cursor-pointer"
          >
            <Icon aria-hidden strokeWidth={1.75} />
            {option.label}
          </DropdownMenuRadioItem>
        );
      })}
    </DropdownMenuRadioGroup>
  );
}
