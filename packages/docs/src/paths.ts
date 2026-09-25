/** Every URL the framework emits goes through here; nothing else may concatenate a path. */

/** Join path segments, collapsing duplicate slashes, always leading with one. */
export function joinPath(...parts: Array<string | undefined | null>): string {
  const joined = parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join('/');
  return '/' + joined.replace(/^\/+/, '').replace(/\/{2,}/g, '/');
}

/** True for anything we must not rewrite: protocol, protocol-relative, fragment, or query. */
export function isExternalHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//');
}

function isUnrewritable(href: string): boolean {
  return isExternalHref(href) || href.startsWith('#') || href.startsWith('?');
}

export function ensureTrailingSlash(href: string): string {
  if (isUnrewritable(href)) return href;
  const [path, rest = ''] = href.split(/(?=[?#])/, 2);
  if (path.endsWith('/')) return href;
  // Never slash something that looks like a file (/llms.txt, /a.md). The extension must carry a
  // letter: a version id ends `.9`, and treating `/v3.9` as a file drops the slash from every
  // version root, costing a host redirect and breaking exact-match comparisons against it.
  if (/\.[a-z0-9]*[a-z][a-z0-9]*$/i.test(path)) return href;
  return path + '/' + rest;
}

/** Astro gives the root `index.mdx` the id "index", not "". */
export function idToPath(id: string): string {
  return id === 'index' ? '' : id;
}

/** Trim trailing slashes for comparison. Keeps a bare "/" intact. */
export function normalizePath(path: string): string {
  let decoded = path;
  try {
    decoded = decodeURI(path);
  } catch {
    // Malformed percent-encoding: compare the raw value.
  }
  return decoded.replace(/\/+$/, '') || '/';
}

export interface PathContext {
  /** Astro's `import.meta.env.BASE_URL`. Always has a leading slash. */
  base: string;
  /** Mounted-at prefix for docs pages, e.g. "docs". Usually empty. */
  pathPrefix?: string;
  /** Version segment for an older copy, e.g. "v3.9". Empty for latest. */
  versionPrefix?: string;
}

/** Prefix a site-absolute path with `base`. For assets: favicons, logos, og images. */
export function withBase(path: string, ctx: PathContext): string {
  if (isUnrewritable(path)) return path;
  return joinPath(ctx.base, path);
}

/** The public URL for a docs collection entry id. The version rides in the route's slug, so it follows the prefix. */
export function docsHref(id: string, ctx: PathContext): string {
  return ensureTrailingSlash(joinPath(ctx.base, ctx.pathPrefix, ctx.versionPrefix, idToPath(id)));
}

/**
 * The URL of an entry's Markdown twin. The home page is `index.md`: its path is empty, and an
 * empty name would give `/.md`, or `https://host.md` once an origin is prepended.
 */
export function markdownTwinHref(id: string, ctx: PathContext): string {
  return `${joinPath(ctx.base, ctx.pathPrefix, ctx.versionPrefix, idToPath(id) || 'index')}.md`;
}

/** Remove `base` (and path/version prefixes) from a pathname, yielding a docs-relative path. */
export function stripBase(pathname: string, ctx: PathContext): string {
  let rest = normalizePath(pathname);
  for (const prefix of [ctx.base, ctx.pathPrefix, ctx.versionPrefix]) {
    if (!prefix) continue;
    const norm = normalizePath(joinPath(prefix));
    if (norm === '/') continue;
    if (rest === norm) return '/';
    if (rest.startsWith(norm + '/')) rest = rest.slice(norm.length);
  }
  return rest || '/';
}

/** Whether `target` is the page currently being viewed. Base-aware, slash-insensitive. */
export function isActive(currentPathname: string, target: string): boolean {
  return normalizePath(currentPathname) === normalizePath(target);
}

/** Whether `target` is the current page or an ancestor of it. Drives group expansion. */
export function isAncestor(currentPathname: string, target: string): boolean {
  const current = normalizePath(currentPathname);
  const t = normalizePath(target);
  return t === '/' ? current === '/' : current === t || current.startsWith(t + '/');
}

interface VersionFallback {
  base: string;
  pathPrefix?: string;
  /** Ids of versions that have a real copy built. */
  copyIds: string[];
  redirects: Array<{ id: string; to: string | null }>;
}

/**
 * Where to send a reader whose URL named a release with no page of its own.
 *
 * Static hosting emits a file per URL, and stubs are emitted for bare release URLs only, so
 * `/v3.2.4/` resolves while `/v3.2.4/components/button/` reaches the not-found page. Per-page
 * stubs would be roughly 3,000 files that grow with every release; this recovers the same
 * destination from one page, and unlike the bare stub it keeps the page the reader asked for.
 *
 * Returns null when the path names no version, which is an ordinary 404.
 */
export function resolveVersionedPath(pathname: string, opts: VersionFallback): string | null {
  const rest = stripBase(pathname, { base: opts.base, pathPrefix: opts.pathPrefix });
  const segments = rest.replace(/^\/+|\/+$/g, '').split('/');
  const first = segments[0];
  if (!first || !/^v\d/.test(first)) return null;

  const tail = segments.slice(1).join('/');
  const reapply = (version: string, page: string) =>
    ensureTrailingSlash(joinPath(opts.base, opts.pathPrefix, version, page));

  // The version exists but this page does not: its root forwards to that version's first page.
  // Sending the reader to latest instead would silently show them a different release.
  if (opts.copyIds.includes(first)) return reapply(first, '');

  const redirect = opts.redirects.find((r) => r.id === first);
  if (!redirect) return null;
  return reapply(redirect.to ?? '', tail);
}
