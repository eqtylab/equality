/**
 * Every URL the docs framework emits goes through this module. Nothing else
 * concatenates a path, so `base` and the version prefix have exactly one owner.
 */

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
  // Don't add a slash to something that looks like a file (e.g. /llms.txt, /a.md)
  if (/\.[a-z0-9]+$/i.test(path)) return href;
  return path + '/' + rest;
}

/**
 * A root `index.md(x)` gets the collection id `"index"` rather than `""`,
 * because Astro's trailing-`/index` strip requires a leading slash. Normalising
 * here keeps default ids everywhere else.
 */
export function idToPath(id: string): string {
  return id === 'index' ? '' : id;
}

/** Trim trailing slashes for comparison. Keeps a bare "/" intact. */
export function normalizePath(path: string): string {
  let decoded = path;
  try {
    decoded = decodeURI(path);
  } catch {
    // Malformed percent-encoding: compare the raw value rather than throwing.
  }
  return decoded.replace(/\/+$/, '') || '/';
}

export interface PathContext {
  /** Astro's `import.meta.env.BASE_URL`. Always has a leading slash. */
  base: string;
  /** Mounted-at prefix for docs pages, e.g. "docs". Usually empty. */
  pathPrefix?: string;
  /** Version segment for a pinned build, e.g. "v3.1". Empty for latest-at-root. */
  versionPrefix?: string;
}

/** Prefix a site-absolute path with `base`. For assets: favicons, logos, og images. */
export function withBase(path: string, ctx: PathContext): string {
  if (isUnrewritable(path)) return path;
  return joinPath(ctx.base, path);
}

/** The public URL for a docs collection entry id. */
export function docsHref(id: string, ctx: PathContext): string {
  return ensureTrailingSlash(joinPath(ctx.base, ctx.versionPrefix, ctx.pathPrefix, idToPath(id)));
}

/** Remove `base` (and version/path prefixes) from a pathname, yielding a docs-relative path. */
export function stripBase(pathname: string, ctx: PathContext): string {
  let rest = normalizePath(pathname);
  for (const prefix of [ctx.base, ctx.versionPrefix, ctx.pathPrefix]) {
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
