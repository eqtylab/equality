/**
 * Build environment for a versioned deploy. `base` must be literal in the
 * consumer's Astro config, so it is threaded by env var. `versionRoot` is
 * separate because a /v3.1/ build still needs the manifest at /docs-versions.json.
 */
export interface DocsEnv {
  site?: string;
  /** Astro's `base`. e.g. '/', '/v3.1/', '/equality/v3.1/' */
  base: string;
  /** Deploy-root-relative directory holding all version directories. */
  versionRoot: string;
  /** This build's version id, e.g. '3.1'. Null for an unversioned build. */
  version: string | null;
  /** Whether this build is the canonical latest (indexable, served at root). */
  isLatest: boolean;
}

function slashed(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '/') return '/';
  return ('/' + trimmed.replace(/^\/+/, '').replace(/\/+$/, '') + '/').replace(/\/{2,}/g, '/');
}

export function resolveDocsEnv(defaults: Partial<DocsEnv> = {}): DocsEnv {
  const env = process.env;
  return {
    site: env.DOCS_SITE ?? defaults.site,
    base: slashed(env.DOCS_BASE ?? defaults.base ?? '/'),
    versionRoot: slashed(env.DOCS_VERSION_ROOT ?? defaults.versionRoot ?? '/'),
    version: env.DOCS_VERSION ?? defaults.version ?? null,
    isLatest: env.DOCS_IS_LATEST ? env.DOCS_IS_LATEST === 'true' : (defaults.isLatest ?? true),
  };
}
