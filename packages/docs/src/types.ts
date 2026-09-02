/** Public type surface. Kept free of `astro:*` imports so it loads in Node and Vite alike. */

export type BadgeVariant = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger';

export interface DocsBadge {
  text: string;
  variant: BadgeVariant;
}

/** A node in the sidebar tree. Groups and links share one shape so rendering stays uniform. */
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

/** The minimum a docs entry must expose for the nav builder. Decoupled from astro:content. */
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
