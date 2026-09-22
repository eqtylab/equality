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
  // Never slash something that looks like a file (/llms.txt, /a.md).
  if (/\.[a-z0-9]+$/i.test(path)) return href;
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
