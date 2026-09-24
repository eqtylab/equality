/** Public types. Keep free of `astro:*` imports so this loads in Node. */

export type BadgeVariant = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger';

export interface DocsBadge {
  text: string;
  variant: BadgeVariant;
  /** 'text-only' suppresses the variant's default icon, e.g. for a method badge like GET or DELETE. */
  display?: 'text-only';
}

/** A node in the sidebar tree. */
export interface NavNode {
  kind: 'page' | 'group' | 'link';
  /** Filesystem name (basename without extension, or directory name). The `order` sort key. */
  name: string;
  label: string;
  /** Absolute, base-prefixed href. Undefined for a group with no index page. */
  href?: string;
  /** Lucide icon name. */
  icon?: string;
  badge?: DocsBadge;
  external?: boolean;
  /** True when this node is the page being viewed. */
  current?: boolean;
  /** True when this node is the current page or an ancestor of it. */
  inPath?: boolean;
  /** Groups only: whether to render expanded. */
  open?: boolean;
  children?: NavNode[];
  /** Extra attributes for `link` nodes. */
  attrs?: Record<string, string | number | boolean>;
}

/** A heading in the on-this-page tree. */
export interface TocNode {
  depth: number;
  slug: string;
  text: string;
  children: TocNode[];
}

/** The minimum a docs entry must expose for the nav builder. */
export interface DocsNavEntry {
  /** Collection id, e.g. "guides/installation" or "index". */
  id: string;
  /** On-disk path, relative to the project root. Needed to tell `index.mdx` from a page. */
  filePath?: string;
  label: string;
  icon?: string;
  badge?: DocsBadge;
  hidden?: boolean;
  draft?: boolean;
  /** The entry is its own folder's index, so its row becomes a group. Set for pages with `openapi:`. */
  navIndex?: boolean;
  /** Sidebar position for a generated entry whose id does not describe its place. */
  navPlacement?: { dir: string; name: string };
}

/** Extension point for generated sections (OpenAPI reference, changelogs, ...). */
export interface DocsPlugin {
  name: string;
  setup(ctx: DocsPluginContext): void | Promise<void>;
}

export interface DocsPluginContext {
  /** Push a top-level group into the sidebar. Appended after folder-derived nodes. */
  addNavGroup(group: NavNode): void;
  /** Merge entries into the route-level MDX component map. */
  addMdxComponents(map: Record<string, unknown>): void;
  /** Raw `astro:config:setup` params: injectRoute, updateConfig, addWatchFile, logger. */
  astro: unknown;
}
