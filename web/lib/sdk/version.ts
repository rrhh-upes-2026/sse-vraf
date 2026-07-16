type SemVer = [number, number, number];

function parse(v: string): SemVer {
  const m = v.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Invalid semver: "${v}"`);
  return [+m[1], +m[2], +m[3]];
}

function gte(a: SemVer, b: SemVer): boolean {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true; // equal
}

/**
 * Returns true when `version` satisfies `range`.
 * Supported range operators: ^ (compatible), ~ (patch-compatible), >= (at-least), exact.
 */
export function satisfies(version: string, range: string): boolean {
  const v = parse(version);
  const r = range.trim();

  if (r.startsWith("^")) {
    // ^x.y.z: same major, >= minor and patch
    const min = parse(r.slice(1));
    if (v[0] !== min[0]) return false;
    return gte(v, min);
  }

  if (r.startsWith("~")) {
    // ~x.y.z: same major+minor, >= patch
    const min = parse(r.slice(1));
    if (v[0] !== min[0] || v[1] !== min[1]) return false;
    return v[2] >= min[2];
  }

  if (r.startsWith(">=")) {
    const min = parse(r.slice(2).trim());
    return gte(v, min);
  }

  // Exact match
  const exact = parse(r);
  return v[0] === exact[0] && v[1] === exact[1] && v[2] === exact[2];
}
