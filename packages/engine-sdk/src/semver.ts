/** Local SemVer helpers — keep SDK free of eos package coupling. */

export function parseSemVer(version: string): [number, number, number] {
  const cleaned = version.trim().replace(/^v/i, '');
  const parts = cleaned.split('.').map((p) => Number.parseInt(p, 10));
  return [
    Number.isFinite(parts[0]) ? parts[0]! : 0,
    Number.isFinite(parts[1]) ? parts[1]! : 0,
    Number.isFinite(parts[2]) ? parts[2]! : 0,
  ];
}

export function compareSemVer(a: string, b: string): number {
  const pa = parseSemVer(a);
  const pb = parseSemVer(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i]! > pb[i]! ? 1 : -1;
  }
  return 0;
}

export function satisfiesMinVersion(actual: string, minVersion: string): boolean {
  return compareSemVer(actual, minVersion) >= 0;
}
