/**
 * Pure nav-tree construction. No fs, no `astro:*` imports -- so this is callable
 * from .astro files, from Node, and from unit tests without a build.
 *
 * Ordering has exactly one implementation here; prev/next and breadcrumbs are
 * derived from the same tree so they can never disagree with the sidebar.
 */
import { docsHref, isActive, isAncestor, type PathContext } from './paths.ts';
import type { DocsBadge, DocsNavEntry, NavNode, TocNode } from './types.ts';

export type SortMode = 'alpha' | 'filename' | 'manual';

export interface GroupConfig {
  label?: string;
  icon?: string;
  order: string[];
  sort?: SortMode;
  collapsed?: boolean;
  hidden: boolean;
  badge?: DocsBadge;
  links: Array<{
    label: string;
    href: string;
    external?: boolean;
    icon?: string;
    badge?: DocsBadge;
    attrs: Record<string, string | number | boolean>;
  }>;
}

export interface BuildNavOptions {
  entries: DocsNavEntry[];
  /** Keyed by directory relative to the content root; '' is the root group. */
  groups: Map<string, GroupConfig>;
  /** `Astro.url.pathname`. */
  currentPath: string;
  paths: PathContext;
  defaultCollapsed: boolean;
  defaultSort: SortMode;
  /** Appended after folder-derived nodes. Plugin-contributed sections land here. */
  extra?: NavNode[];
  onWarn?: (message: string) => void;
}

/** "getting-started" -> "Getting Started" */
export function titleCase(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Normalise an `order` token so 'foo', 'foo.mdx' and 'foo/' all mean the same child. */
function normalizeOrderToken(token: string): string {
  return token
    .trim()
    .replace(/\/+$/, '')
    .replace(/\.(md|mdx)$/i, '');
}

function byLocale(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

interface Classified {
  entry: DocsNavEntry;
  dir: string;
  name: string;
  isIndex: boolean;
}

/**
 * Split an entry id into (directory, name, isIndex).
 *
 * `isIndex` is decided from `filePath`, not the id: Astro strips a trailing
 * `/index` from ids, so `guides/index.mdx` and `guides.mdx` both arrive as
 * "guides" and only the on-disk path can tell them apart.
 */
function classify(entry: DocsNavEntry): Classified {
  const id = entry.id;
  const segments = id.split('/').filter(Boolean);
  const fileBase = entry.filePath
    ? (entry.filePath.split('/').pop() ?? '').replace(/\.(md|mdx)$/i, '')
    : undefined;
  const isIndex = fileBase === 'index' || id === 'index';

  if (isIndex) {
    // Root index -> the '' group; guides/index.mdx -> the 'guides' group.
    const dir = id === 'index' ? '' : segments.join('/');
    return { entry, dir, name: segments.at(-1) ?? '', isIndex: true };
  }
  return {
    entry,
    dir: segments.slice(0, -1).join('/'),
    name: segments.at(-1) ?? '',
    isIndex: false,
  };
}

function ancestorsOf(dir: string): string[] {
  if (!dir) return [];
  const parts = dir.split('/');
  const out: string[] = [];
  for (let i = 1; i <= parts.length; i++) out.push(parts.slice(0, i).join('/'));
  return out;
}

export function buildNavTree(options: BuildNavOptions): NavNode[] {
  const {
    entries,
    groups,
    currentPath,
    paths,
    defaultCollapsed,
    defaultSort,
    extra = [],
    onWarn,
  } = options;

  // 1. Classify.
  const visible = entries.filter((e) => !e.draft);
  const classified = visible.map(classify);
  const indexOf = new Map<string, Classified>();
  const filesIn = new Map<string, Classified[]>();

  for (const c of classified) {
    if (c.isIndex) {
      indexOf.set(c.dir, c);
    } else {
      const list = filesIn.get(c.dir);
      if (list) list.push(c);
      else filesIn.set(c.dir, [c]);
    }
  }

  // 2. Materialise the directory set, including ancestors and group-file-only dirs.
  const dirs = new Set<string>(['']);
  for (const key of [...filesIn.keys(), ...indexOf.keys(), ...groups.keys()]) {
    dirs.add(key);
    for (const ancestor of ancestorsOf(key)) dirs.add(ancestor);
  }
  dirs.delete('~root'); // sentinel used by the groups loader, never a real directory

  const childDirsOf = new Map<string, string[]>();
  for (const dir of dirs) {
    if (!dir) continue;
    const parent = dir.split('/').slice(0, -1).join('/');
    const list = childDirsOf.get(parent);
    if (list) list.push(dir);
    else childDirsOf.set(parent, [dir]);
  }

  const groupFor = (dir: string): GroupConfig | undefined =>
    groups.get(dir === '' ? '~root' : dir) ?? groups.get(dir);

  // 3-7. Recurse.
  const building = new Set<string>();

  function pageNode(c: Classified): NavNode {
    const href = docsHref(c.entry.id, paths);
    return {
      kind: 'page',
      name: c.name,
      label: c.entry.label,
      href,
      icon: c.entry.icon,
      badge: c.entry.badge,
      current: isActive(currentPath, href),
      inPath: isActive(currentPath, href),
    };
  }

  function groupNode(dir: string): NavNode | null {
    if (building.has(dir)) return null; // defensive; the dir set is acyclic by construction
    building.add(dir);
    try {
      const cfg = groupFor(dir);
      const index = indexOf.get(dir);
      const sortMode = cfg?.sort ?? defaultSort;

      const pages = (filesIn.get(dir) ?? []).filter((c) => !c.entry.hidden).map(pageNode);
      const subgroups = (childDirsOf.get(dir) ?? [])
        .map(groupNode)
        .filter((n): n is NavNode => n !== null);

      const children = orderChildren([...pages, ...subgroups], cfg, sortMode, dir, onWarn);

      for (const link of cfg?.links ?? []) {
        children.push({
          kind: 'link',
          name: link.label,
          label: link.label,
          href: link.href,
          icon: link.icon,
          badge: link.badge,
          external: link.external,
          attrs: link.attrs,
        });
      }

      // 7. Prune: a group with no children and no landing page is not navigable.
      if (children.length === 0 && !index) return null;
      if (cfg?.hidden) return null;

      const href = index ? docsHref(index.entry.id, paths) : undefined;
      const label = cfg?.label ?? index?.entry.label ?? titleCase(dir.split('/').pop() ?? '');

      const inPath =
        (href ? isAncestor(currentPath, href) : false) || children.some((c) => c.inPath);

      return {
        kind: 'group',
        name: dir.split('/').pop() ?? '',
        label,
        href,
        icon: cfg?.icon ?? index?.entry.icon,
        badge: cfg?.badge ?? index?.entry.badge,
        current: href ? isActive(currentPath, href) : false,
        inPath,
        // A deep link must always reveal itself, so containing the current page
        // wins over a `collapsed: true` preference.
        open: inPath || !(cfg?.collapsed ?? defaultCollapsed),
        children,
      };
    } finally {
      building.delete(dir);
    }
  }

  const root = groupNode('');
  const rootChildren = root?.children ?? [];
  return [...rootChildren, ...extra];
}

function orderChildren(
  children: NavNode[],
  cfg: GroupConfig | undefined,
  sortMode: SortMode,
  dir: string,
  onWarn?: (message: string) => void
): NavNode[] {
  const byName = new Map<string, NavNode>();
  for (const child of children) {
    if (!byName.has(child.name)) byName.set(child.name, child);
  }

  const taken = new Set<NavNode>();
  const ordered: NavNode[] = [];

  for (const token of cfg?.order ?? []) {
    const key = normalizeOrderToken(token);
    const hit = byName.get(key);
    if (!hit) {
      // The typo case. Warning names the file and the token, because a silently
      // ignored ordering key is the exact failure that makes this config hateful.
      onWarn?.(
        `_group.yaml in "${dir || '<root>'}": order lists "${token}", but no child is named "${key}". ` +
          `Available: ${[...byName.keys()].join(', ') || '(none)'}`
      );
      continue;
    }
    if (!taken.has(hit)) {
      taken.add(hit);
      ordered.push(hit);
    }
  }

  let rest = children.filter((c) => !taken.has(c));

  if (sortMode === 'manual') {
    // Unlisted pages still build and are still reachable; they just aren't in the nav.
    rest = [];
  } else if (sortMode === 'filename') {
    rest.sort((a, b) => byLocale(a.name, b.name));
  } else {
    // Sort by the visible label, with the filename as a stable tiebreak.
    rest.sort((a, b) => byLocale(a.label, b.label) || byLocale(a.name, b.name));
  }

  return [...ordered, ...rest];
}

/** Depth-first list of internal, linkable nodes. Drives prev/next. */
export function flattenNav(tree: NavNode[]): NavNode[] {
  const out: NavNode[] = [];
  const walk = (nodes: NavNode[]) => {
    for (const node of nodes) {
      if (node.href && node.kind !== 'link') out.push(node);
      if (node.children?.length) walk(node.children);
    }
  };
  walk(tree);
  return out;
}

export function prevNextFor(
  tree: NavNode[],
  currentPath: string
): { prev?: NavNode; next?: NavNode } {
  const flat = flattenNav(tree);
  const i = flat.findIndex((n) => n.href && isActive(currentPath, n.href));
  if (i === -1) return {};
  return { prev: flat[i - 1], next: flat[i + 1] };
}

/** Ancestor chain from the root down to the current page. */
export function breadcrumbsFor(tree: NavNode[], currentPath: string): NavNode[] {
  const trail: NavNode[] = [];
  const walk = (nodes: NavNode[]): boolean => {
    for (const node of nodes) {
      const hit = node.href ? isActive(currentPath, node.href) : false;
      if (hit) {
        trail.push(node);
        return true;
      }
      if (node.children?.length) {
        trail.push(node);
        if (walk(node.children)) return true;
        trail.pop();
      }
    }
    return false;
  };
  walk(tree);
  return trail;
}

/** Nest a flat heading list into a tree, clamped to [minLevel, maxLevel]. */
export function buildTocTree(
  headings: Array<{ depth: number; slug: string; text: string }>,
  { minLevel = 2, maxLevel = 3 }: { minLevel?: number; maxLevel?: number } = {}
): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];

  for (const h of headings) {
    if (h.depth < minLevel || h.depth > maxLevel) continue;
    const node: TocNode = { depth: h.depth, slug: h.slug, text: h.text, children: [] };
    while (stack.length && (stack.at(-1) as TocNode).depth >= node.depth) stack.pop();
    const parent = stack.at(-1);
    if (parent) parent.children.push(node);
    else roots.push(node);
    stack.push(node);
  }
  return roots;
}
