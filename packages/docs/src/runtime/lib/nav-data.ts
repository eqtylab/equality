/**
 * Bridges the two content collections into the pure nav builder.
 *
 * Runs in the Vite graph (it needs `astro:content`), so it lives in the runtime
 * tree rather than alongside the Node-side modules.
 */
import { breadcrumbsFor, buildNavTree, buildTocTree, prevNextFor } from '@eqtylab/docs/nav';
import type { GroupConfig } from '@eqtylab/docs/nav';
import type { DocsNavEntry, NavNode } from '@eqtylab/docs/types';
import { getCollection } from 'astro:content';
import CONFIG from 'virtual:eqty-docs/config';

export { buildTocTree, breadcrumbsFor, prevNextFor };

export function pathContext() {
  return {
    base: import.meta.env.BASE_URL,
    pathPrefix: CONFIG.pathPrefix,
    versionPrefix: CONFIG.env.version && !CONFIG.env.isLatest ? `v${CONFIG.env.version}` : '',
  };
}

/** All docs entries, with drafts filtered out unless we're in `astro dev`. */
export async function docsEntries() {
  return getCollection('docs', ({ data }: { data: { draft?: boolean } }) =>
    import.meta.env.DEV ? true : !data.draft
  );
}

async function groupMap(): Promise<Map<string, GroupConfig>> {
  const map = new Map<string, GroupConfig>();
  try {
    const groups = await getCollection('docsGroups');
    for (const group of groups) {
      map.set(group.id, group.data as GroupConfig);
    }
  } catch {
    // The docsGroups collection is optional: a site with no _group.yaml anywhere
    // is a valid site, it just gets fully alphabetical ordering.
  }
  return map;
}

export async function docsNav(currentPath: string): Promise<NavNode[]> {
  const [entries, groups] = await Promise.all([docsEntries(), groupMap()]);

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
    paths: pathContext(),
    defaultCollapsed: CONFIG.sidebar.collapsed,
    defaultSort: CONFIG.sidebar.sort,
    extra: (CONFIG.sidebar.extra ?? []) as NavNode[],
    onWarn: warnOnce,
  });
}

// The nav is rebuilt per page, so an ordering warning would otherwise repeat
// once per page. Config problems should be reported once per build.
const warned = new Set<string>();
function warnOnce(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(`[@eqtylab/docs] ${message}`);
}

/** Generalises the old bespoke `deprecated` sidebar marker into the badge system. */
function deprecationBadge(deprecated: unknown) {
  if (!deprecated) return undefined;
  return { text: 'Deprecated', variant: 'warning' as const };
}
