export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function blueprintCanonicalKey(
  subject: string,
  grade: string,
  topic: string,
): string {
  return `bp::${normalize(subject)}::${normalize(grade)}::${normalize(topic)}`;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
