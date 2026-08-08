import { Link } from "@tanstack/react-router";
import { Library } from "lucide-react";
import { DISCIPLINE_LABEL } from "@ludicon/domain";
import { EmptyState, SectionHeader, cn } from "@ludicon/ui";

import { countLabel } from "../-shared/paper-presentation";
import type { Shelf } from "./use-desk";

export interface ShelvesProps {
  shelves: readonly Shelf[];
}

/**
 * The teacher's disciplines, as shelves.
 *
 * A shelf exists because papers carry that discipline — nothing here is a
 * category the product invented and then hoped would fill up. Each one is a
 * real filter into the projects page, so the shelf is a way through rather
 * than a label.
 *
 * The link carries the enum id, not the label. `?disciplina=limba_romana`
 * survives a copy-paste, an email and a browser history entry; `Limba și
 * literatura română` survives none of the three, which is the argument
 * `@ludicon/domain` makes for the ids being ASCII in the first place.
 */
export function Shelves({ shelves }: ShelvesProps) {
  return (
    <section aria-labelledby="rafturi">
      <SectionHeader
        id="rafturi"
        title="Rafturile tale"
        supporting="Disciplinele la care ai lucrat, cu tot ce ai scris la fiecare."
      />

      {shelves.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={<Library aria-hidden strokeWidth={1.75} className="size-6" />}
          title="Încă nu ai rafturi"
          explanation="Fiecare disciplină la care scrii o evaluare își primește raftul ei aici, cu toate proiectele adunate la un loc."
        />
      ) : (
        <ul className="mt-4 grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
          {shelves.map((shelf) => (
            <li key={shelf.discipline}>
              <Link
                to="/projects"
                search={{ disciplina: shelf.discipline }}
                className={cn(
                  "flex min-h-11 cursor-pointer flex-col gap-1 rounded-md p-4",
                  "border border-border bg-surface",
                  "transition-[background-color,border-color] duration-[var(--motion-fast)] ease-standard",
                  "hover:border-border-strong hover:bg-muted",
                )}
              >
                <span className="text-base leading-[1.4] font-medium text-foreground">
                  {DISCIPLINE_LABEL[shelf.discipline]}
                </span>
                <span className="text-sm leading-[1.5] text-muted-foreground">
                  {countLabel(shelf.papers, "proiect", "proiecte", "un")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
