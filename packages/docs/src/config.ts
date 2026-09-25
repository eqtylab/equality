/** Integration options: the whole consumer-facing configuration surface. */
import { z } from 'astro/zod';

import { GITHUB_HOST, githubUrl } from './internal/github-url.ts';

export const BRAND_ASSET_PREFIX = '/_equality';

/** EQTY Lab files the integration serves. Pass one wherever a `public/` path is accepted. */
export const brandAssets = {
  logo: `${BRAND_ASSET_PREFIX}/eqty-logo.svg`,
  favicon: `${BRAND_ASSET_PREFIX}/favicon.png`,
  github: `${BRAND_ASSET_PREFIX}/github.svg`,
  ogImage: `${BRAND_ASSET_PREFIX}/og-image.jpg`,
} as const;

const headerLink = z.object({
  label: z.string(),
  href: z.string(),
  /**
   * A Lucide name like `BookOpen`, or a path to an SVG in `public/` like
   * `/github.svg`, or `brandAssets.github`. An SVG must be white: light mode inverts it.
   */
  icon: z.string().optional(),
  external: z.boolean().optional(),
});

export const docsConfigSchema = z.object({
  /** Site name, shown in the header and used as the `<title>` suffix. */
  title: z.string(),
  description: z.string().optional(),
  /** Path to a favicon, relative to `public/`. Base is applied automatically. */
  favicon: z.string().default(brandAssets.favicon),

  /**
   * The picture in a shared link's preview card, a 1200×630 EQTY Lab card by default. A path
   * in `public/` or a full URL; `false` removes it. Needs Astro's `site`: previews only
   * accept a full URL, so without `site` a path is left out.
   */
  ogImage: z.union([z.string(), z.literal(false)]).default(brandAssets.ogImage),

  /**
   * The header mark, the EQTY Lab one by default. `false` leaves `title` as text alone.
   * Either way a constant "Docs" label follows it, and `title` heads the sidebar.
   */
  logo: z
    .union([
      z.literal(false),
      z.object({
        src: z.string(),
        /** Name the company: the brand link reads as this plus "Docs". */
        alt: z.string().default(''),
      }),
    ])
    .default({ src: brandAssets.logo, alt: 'EQTY Lab' }),

  /**
   * The header's GitHub link. Unset, it points at the site's `package.json` `repository`,
   * else the EQTY Lab organisation. A GitHub URL or `owner/repo` overrides both; `false` removes it.
   */
  github: z
    .union([z.literal(false), z.string()])
    .transform((value, ctx) => {
      if (value === false) return value;
      const url = /^https?:\/\//i.test(value) && GITHUB_HOST.test(value) ? value : githubUrl(value);
      if (url) return url;
      ctx.addIssue({
        code: 'custom',
        message: `expected a GitHub URL or owner/repo, got ${JSON.stringify(value)}`,
      });
      return z.NEVER;
    })
    .optional(),

  /** Content directory, relative to `src/`. */
  contentDir: z.string().default('content/docs'),

  /** Mount docs under a sub-path, e.g. 'docs' for /docs/*. Empty means the site root. */
  pathPrefix: z.string().default(''),

  sidebar: z
    .object({
      /** Default collapse state for groups with no explicit `collapsed`. */
      collapsed: z.boolean().default(false),
      /** Default append order for children absent from a group's `order`. */
      sort: z.enum(['alpha', 'filename', 'manual']).default('alpha'),
      /**
       * Label for the row that links to a section's own `index.mdx`. A section header is
       * never a link - it only expands - so the index page needs a row of its own.
       */
      indexLabel: z.string().default('Overview'),
      /** Extra top-level nodes, appended after folder-derived ones. */
      extra: z.array(z.any()).default([]),
    })
    .prefault({}),

  header: z
    .object({
      links: z.array(headerLink).default([]),
      showThemeToggle: z.boolean().default(true),
    })
    .prefault({}),

  footer: z
    .object({
      /** Base URL for "Edit this page"; the content path is appended. */
      editUrl: z.string().optional(),
      showPrevNext: z.boolean().default(true),
      text: z.string().optional(),
    })
    .prefault({}),

  tableOfContents: z
    .union([
      z.object({
        minLevel: z.number().int().min(1).max(6).default(2),
        maxLevel: z.number().int().min(1).max(6).default(3),
      }),
      z.literal(false),
    ])
    .prefault({}),

  code: z
    .object({
      /** 'codeblock' renders fences through Equality's CodeBlock; 'shiki' uses Astro's Shiki. */
      highlighter: z.enum(['codeblock', 'shiki']).default('codeblock'),
      /** Shiki themes; only consulted when `highlighter` is 'shiki'. */
      themes: z
        .object({ light: z.string(), dark: z.string() })
        .default({ light: 'github-light', dark: 'github-dark' }),
      wrap: z.boolean().default(false),
      langs: z.array(z.string()).default([]),
    })
    .prefault({}),

  search: z
    .object({
      /** 'pagefind' indexes the built HTML. Dev serves that index, so it needs one build. */
      provider: z.enum(['pagefind', 'none']).default('pagefind'),
    })
    .prefault({}),

  routing: z
    .object({
      /** Inject the catch-all docs route. Disable to own routing entirely. */
      injectPages: z.boolean().default(true),
      /** Emit a `.md` twin per page plus `/llms.txt`. */
      markdownTwins: z.boolean().default(true),
      notFound: z.boolean().default(true),
    })
    .prefault({}),

  theme: z
    .object({
      /** 'global' puts tokens on <html>; 'scoped' wraps in a ThemeProvider. */
      mode: z.enum(['global', 'scoped']).default('global'),
      /** Persist the reader's choice to localStorage. */
      persist: z.boolean().default(true),
    })
    .prefault({}),

  /**
   * Stylesheets loaded on every docs page. A project-relative path ('./src/styles/site.css')
   * or a package specifier. Resolved against the project root, so dev and build agree.
   */
  customCss: z.array(z.string()).default([]),

  /**
   * Client modules loaded on every docs page. Bundled rather than served as-is, so they may
   * import from node_modules - which is what a script mutating rendered text needs, since it
   * has to call Equality's `scheduleHighlight` afterwards to repaint code blocks.
   */
  clientScripts: z.array(z.string()).default([]),

  /** Install @astrojs/mdx, @astrojs/react and Tailwind when absent. */
  autoIntegrations: z.boolean().default(true),

  /**
   * On by default; `false` turns it off. Must be `.prefault`, never `.default`: Zod 4 short-circuits
   * `.default` without parsing, so a consumer who writes nothing would receive a bare `{}` carrying
   * neither `tags` nor `granularity`, and the build would select nothing with no error.
   */
  versions: z
    .union(
      [
        z.literal(false),
        z
          .object({
            /** The documented product's version, e.g. '4.0.0'. Defaults to the highest tag matching `tags`. */
            current: z.string().optional(),
            /** Git tag glob for releases. Tags that are not MAJOR.MINOR.PATCH are skipped with a warning. */
            tags: z.string().default('v*'),
            /** One frozen copy per major, per minor, or per release. Releases without a copy redirect to theirs. */
            granularity: z.enum(['major', 'minor', 'patch']).default('major'),
          })
          .prefault({}),
      ],
      {
        // A union reports its own failure and drops the inner path, so a typo in `granularity`
        // would surface as "versions: Invalid input". Spelling the contract out here is what keeps
        // a misconfigured docsite failing loudly rather than silently versioning nothing.
        error:
          'expected false, or an object with optional current, tags and granularity (major | minor | patch)',
      }
    )
    .prefault({}),

  /** Generated-section plugins (OpenAPI reference, changelogs, ...). */
  plugins: z.array(z.any()).default([]),
});

export type DocsUserConfig = z.input<typeof docsConfigSchema>;
export type DocsConfig = z.output<typeof docsConfigSchema>;

export function resolveConfig(user: DocsUserConfig): DocsConfig {
  const result = docsConfigSchema.safeParse(user);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`[@eqtylab/docs] Invalid configuration:\n${issues}`);
  }
  return result.data;
}
