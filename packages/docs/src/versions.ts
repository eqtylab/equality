/** Pure. Turns a tag list into the copies to build and the release URLs that redirect to them. */

export type Granularity = 'major' | 'minor' | 'patch';

export interface ParsedTag {
  tag: string;
  major: number;
  minor: number;
  patch: number;
  version: string;
}

export interface VersionCopy {
  id: string;
  suffix: string;
  group: string;
  tag: string;
}

/** `to: null` means latest, i.e. `/`. */
export interface VersionRedirect {
  id: string;
  to: string | null;
}

export interface VersionSelection {
  /** Newest first. */
  copies: VersionCopy[];
  redirects: VersionRedirect[];
  /** Tags that did not parse as MAJOR.MINOR.PATCH, prereleases included. */
  skipped: string[];
  /** Parsed tags above `current`. */
  above: string[];
}

/*
 * The prefix is free, the version is not. `tags` decides which tags are considered; this decides
 * what counts as a release among them, and a consumer tagging `@scope/pkg@1.2.3` or `sdk-v1.2.3`
 * has no glob that could rescue them from a `^v?` anchor. Strict after the prefix, so
 * `v1.2.3-beta.1`, `v1.2` and `v1.2.3.4` all still fall out as skipped.
 */
const SEMVER = /(?:^|[^0-9.])(\d+)\.(\d+)\.(\d+)$/;

/** Finest to coarsest. A granularity's own level is included, so the current group gets a stub. */
const LEVELS: Granularity[] = ['patch', 'minor', 'major'];

export function parseTag(tag: string): ParsedTag | null {
  const m = SEMVER.exec(tag.trim());
  if (!m) return null;
  const major = Number(m[1]);
  const minor = Number(m[2]);
  const patch = Number(m[3]);
  return { tag, major, minor, patch, version: `${major}.${minor}.${patch}` };
}

export function compareTags(a: ParsedTag, b: ParsedTag): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

export function groupOf(v: ParsedTag, granularity: Granularity): string {
  if (granularity === 'major') return `${v.major}`;
  if (granularity === 'minor') return `${v.major}.${v.minor}`;
  return v.version;
}

export function idOf(group: string): string {
  return `v${group}`;
}

/** Collection names are identifiers, so `v3.9` becomes `v3_9`. */
export function suffixOf(id: string): string {
  return id.replace(/\./g, '_');
}

export function highestTag(tags: string[]): ParsedTag | null {
  const parsed = tags.map(parseTag).filter((t): t is ParsedTag => t !== null);
  if (!parsed.length) return null;
  return parsed.sort(compareTags)[parsed.length - 1]!;
}

export function selectVersions(
  tags: string[],
  current: string,
  granularity: Granularity,
  skippedGroups: string[] = []
): VersionSelection {
  const cur = parseTag(current);
  if (!cur) {
    throw new Error(`[@eqtylab/docs] versions.current "${current}" is not MAJOR.MINOR.PATCH`);
  }

  const skipped: string[] = [];
  const above: string[] = [];
  const parsed: ParsedTag[] = [];
  for (const tag of tags) {
    const p = parseTag(tag);
    if (p) parsed.push(p);
    else skipped.push(tag);
  }
  parsed.sort(compareTags);

  const currentGroup = groupOf(cur, granularity);
  const skip = new Set(skippedGroups);

  // Ascending insertion order, so "nearest lower covered group" is a running variable.
  const byGroup = new Map<string, ParsedTag[]>();
  const inCurrent: ParsedTag[] = [];
  const covered: ParsedTag[] = [];
  for (const p of parsed) {
    if (compareTags(p, cur) > 0) {
      above.push(p.tag);
      continue;
    }
    covered.push(p);
    const g = groupOf(p, granularity);
    if (g === currentGroup) {
      inCurrent.push(p);
      continue;
    }
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(p);
  }

  const copies: VersionCopy[] = [];
  const picks: ParsedTag[] = [];
  const coverOf = new Map<string, string | null>();
  let lastCovered: string | null = null;
  for (const [g, members] of byGroup) {
    if (skip.has(g)) {
      coverOf.set(g, lastCovered);
      continue;
    }
    const pick = members[members.length - 1]!;
    const id = idOf(g);
    copies.push({ id, suffix: suffixOf(id), group: g, tag: pick.tag });
    picks.push(pick);
    coverOf.set(g, id);
    lastCovered = id;
  }

  const redirects: VersionRedirect[] = [];
  for (const [g, members] of byGroup) {
    const to = coverOf.get(g) ?? null;
    for (const p of members) {
      const id = idOf(p.version);
      // At `patch` granularity the copy is its own tag; a self-redirect would collide with its root.
      if (id === to) continue;
      redirects.push({ id, to });
    }
  }
  for (const p of inCurrent) redirects.push({ id: idOf(p.version), to: null });

  copies.reverse();
  picks.reverse();

  // Group stubs are what make `granularity` a setting rather than a one-way door. Every grouping
  // at or coarser than the configured one resolves to the best copy inside it, so `/v3.9/` keeps
  // working after a move to `patch` and `/v3.9.1/` keeps working after a move back. Without them a
  // change of setting silently retires every URL the previous setting published: at `patch` every
  // copy is its own tag, so nothing above emits `v3.9`, which is not a tag and never was.
  const emittedIds = new Set(redirects.map((r) => r.id));
  const copyIds = new Set(copies.map((c) => c.id));
  // The current version is known from config and need not be tagged yet, so it is seeded here:
  // `/v4.0/` and `/v4/` should resolve to latest on the strength of the config alone. Only when
  // a copy exists, though, or a repository with no tags would stop being dormant.
  const stubSources = copies.length
    ? covered.some((p) => p.version === cur.version)
      ? covered
      : [...covered, cur]
    : [];

  for (const level of LEVELS.slice(LEVELS.indexOf(granularity))) {
    const seenGroups = new Set<string>();
    for (let i = stubSources.length - 1; i >= 0; i--) {
      const group = groupOf(stubSources[i]!, level);
      if (seenGroups.has(group)) continue;
      seenGroups.add(group);

      const id = idOf(group);
      if (copyIds.has(id) || emittedIds.has(id)) continue;

      const holdsCurrent = groupOf(cur, level) === group;
      let cover: string | null = null;
      for (let c = 0; !holdsCurrent && c < copies.length; c++) {
        if (groupOf(picks[c]!, level) === group) {
          cover = copies[c]!.id;
          break;
        }
      }

      // A group with no copy beneath it and no claim on latest has nothing honest to point at.
      // Sending `/v2/` to latest would tell a reader that v2 docs are the current ones.
      if (!holdsCurrent && cover === null) continue;

      redirects.push({ id, to: cover });
      emittedIds.add(id);
    }
  }

  return { copies, redirects, skipped, above };
}
