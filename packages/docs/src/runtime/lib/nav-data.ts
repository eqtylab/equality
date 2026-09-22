/** Bridges the content collections into the pure nav builder. Needs `astro:content`, so it lives in the runtime tree. */
import {
  breadcrumbsFor,
  buildNavTree,
  buildTocTree,
  flattenNav,
  prevNextFor,
} from '@eqtylab/docs/nav';
import type { GroupConfig } from '@eqtylab/docs/nav';
import { docsHref } from '@eqtylab/docs/paths';
import type { DocsNavEntry, NavNode } from '@eqtylab/docs/types';
import { getCollection } from 'astro:content';
import CONFIG from 'virtual:eqty-docs/config';

export { buildTocTree, breadcrumbsFor, prevNextFor };

/** The version is a route segment after the path prefix; latest has none. */
export function pathContext(versionId?: string) {
  return {
    base: import.meta.env.BASE_URL,
    pathPrefix: CONFIG.pathPrefix,
    versionPrefix: versionId,
  };
}

/** Collection names for a version id, or for latest when undefined. */
export function collectionsFor(versionId?: string): { docs: string; groups: string } {
  if (!versionId) return { docs: 'docs', groups: 'docsGroups' };
  const entry = CONFIG.versionManifest.find((v) => v.id === versionId);
  if (!entry) throw new Error(`[@eqtylab/docs] unknown version id "${versionId}"`);
  return { docs: `docs_${entry.suffix}`, groups: `docsGroups_${entry.suffix}` };
}

// `getCollection` is typed against the generated DataEntryMap, which cannot know names built at runtime.
const anyCollection = getCollection as unknown as (
  name: string,
  filter?: (entry: { data: Record<string, unknown> }) => boolean
) => Promise<never[]>;

/** All entries of a version, with drafts filtered out unless we're in `astro dev`. */
export async function docsEntries(versionId?: string) {
  return anyCollection(collectionsFor(versionId).docs, ({ data }) =>
    import.meta.env.DEV ? true : !(data as { draft?: boolean }).draft
  );
}

async function groupMap(versionId?: string): Promise<Map<string, GroupConfig>> {
  const map = new Map<string, GroupConfig>();
  try {
    const groups = await anyCollection(collectionsFor(versionId).groups);
    for (const group of groups as Array<{ id: string; data: GroupConfig }>) {
      map.set(group.id, group.data);
    }
  } catch {
    // The groups collection is optional; no _group.yaml means alphabetical ordering.
  }
  return map;
}

export async function docsNav(currentPath: string, versionId?: string): Promise<NavNode[]> {
  const [entries, groups] = await Promise.all([docsEntries(versionId), groupMap(versionId)]);

  const navEntries: DocsNavEntry[] = entries.map((entry) => ({
    id: entry.id,
    filePath: entry.filePath,
    label: entry.data.navLabel ?? entry.data.title,
    icon: entry.data.icon,
    badge: entry.data.badge ?? deprecationBadge(entry.data.deprecated),
    hidden: entry.data.hidden,
    draft: entry.data.draft,
  }));

  return buildNavTree({
    entries: navEntries,
    groups,
    currentPath,
    paths: pathContext(versionId),
    defaultCollapsed: CONFIG.sidebar.collapsed,
    defaultSort: CONFIG.sidebar.sort,
    extra: (CONFIG.sidebar.extra ?? []) as NavNode[],
    onWarn: warnOnce,
  });
}

// The nav is rebuilt per page; report each config problem once per build.
const warned = new Set<string>();
function warnOnce(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`[@eqtylab/docs] ${message}`);
}

function deprecationBadge(deprecated: unknown) {
  if (!deprecated) return undefined;
  return { text: 'Deprecated', variant: 'warning' as const };
}

/** The first linkable page of a version. Version roots and switcher fallbacks land here. */
export async function firstNavHref(versionId?: string): Promise<string> {
  const tree = await docsNav('/', versionId);
  return flattenNav(tree)[0]?.href ?? docsHref('', pathContext(versionId));
}
