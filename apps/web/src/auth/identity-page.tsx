import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PUBLIC_PATH } from "./session";

export interface IdentityPageProps {
  title: string;
  lead: string;
  children: ReactNode;
}

/**
 * The frame both identity surfaces sit in.
 *
 * A page, not a modal — that was the point of the change. A modal says "this
 * is a small interruption to what you were doing"; signing in to a tool you
 * keep next term's lessons in is not that, and a dialog that can be dismissed
 * by clicking beside it is the wrong shape for the one door into the product.
 *
 * The heading is the app's own, above Clerk's card rather than inside it.
 * Clerk's header is styled by Clerk; keeping the human sentence outside means
 * the first thing a teacher reads is in the product's voice and in the
 * product's display face, whatever Clerk decides to do with its own chrome.
 *
 * Everything here resolves through semantic tokens, so the page is correct in
 * both themes for the same reason the rest of the app is.
 */
export function IdentityPage({ title, lead, children }: IdentityPageProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="px-6 py-5">
        <Link
          to={PUBLIC_PATH}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors duration-[--motion-fast] hover:text-foreground"
        >
          <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
          Înapoi
        </Link>
      </header>

      <main
        id="continut"
        className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16"
      >
        <div className="flex max-w-prose flex-col gap-2 text-center">
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
          <p className="text-base text-muted-foreground">{lead}</p>
        </div>

        {children}
      </main>
    </div>
  );
}
