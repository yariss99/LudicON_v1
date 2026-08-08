import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@ludicon/ui";

import { Plus } from "lucide-react";

import { STUDIO_NAV, type NavItem } from "../../lib/navigation";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (item: NavItem) => void;
  onCreate: () => void;
}

/**
 * `Căutare rapidă` — every destination and every starting point, in one list.
 *
 * The palette is the canonical way in from the keyboard, and ⌘K is the shell's
 * only binding — see `use-nav-hotkeys.ts` for why per-destination letters were
 * removed. So this list is not a summary of the shortcuts; it is the reason
 * there only needs to be one.
 *
 * It is built by mapping `STUDIO_NAV`, never by listing destinations here. That
 * is what made removing `Bibliotecă` a one-line change in the navigation model
 * rather than a hunt through three consumers — and it is why this file cannot
 * drift into offering a command that goes nowhere. The rejected alternative,
 * a hand-written list with its own copy, is precisely how a palette ends up
 * being the last place a dead destination survives.
 *
 * Rows carry a second line because a label alone ("Activitate") does not say
 * what waits behind it. cmdk matches on the explicit `value`, so the
 * description is searchable too — typing "lecții" finds `Calendar`.
 */
export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onCreate,
}: CommandPaletteProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      description="Scrie pentru a găsi o secțiune sau ceva de creat. Săgețile aleg, Enter deschide."
    >
      <CommandInput placeholder="Caută…" />
      <CommandList>
        <CommandEmpty />

        <CommandGroup heading="Mergi la">
          {STUDIO_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.id}
                value={`${item.label} ${item.description}`}
                onSelect={() => {
                  onNavigate(item);
                }}
              >
                <Icon aria-hidden strokeWidth={1.75} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate leading-[1.35]">{item.label}</span>
                  <span className="truncate text-[0.8125rem] leading-[1.4] text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* One row, not six. The palette used to list every kind of
            material a teacher could start; there is one kind of project now,
            so this is the same single action the rail carries — kept here
            because the palette is the canonical keyboard map and an action
            missing from it reads as an action that has no shortcut. */}
        <CommandGroup heading="Creează">
          <CommandItem
            value="Creează un proiect proiect nou evaluare fișă"
            onSelect={onCreate}
          >
            <Plus aria-hidden strokeWidth={1.75} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate leading-[1.35]">
                Creează un proiect
              </span>
              <span className="truncate text-[0.8125rem] leading-[1.4] text-muted-foreground">
                O evaluare nouă, de la pagina albă
              </span>
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
