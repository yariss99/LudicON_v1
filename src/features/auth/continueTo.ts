export function continueTo(search: string, fallback = "/"): string {
  const params = new URLSearchParams(search);
  const next = params.get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
