import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-2xl text-foreground">
        Nu am găsit pagina
      </h1>
      <p className="max-w-prose text-muted-foreground">
        Pagina pe care o cauți nu mai există sau a fost mutată.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex min-h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-[--motion-fast] hover:bg-primary-hover"
      >
        Înapoi la biroul meu
      </Link>
    </div>
  );
}
