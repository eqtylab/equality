/** Integration options: the whole consumer-facing configuration surface. */
import { z } from 'astro/zod';

import { lucideNameFor } from './internal/icons.ts';

export const BRAND_ASSET_PREFIX = '/_equality';

/** EQTY Lab files the integration serves. Pass one wherever a `public/` path is accepted. */
export const brandAssets = {
  logo: `${BRAND_ASSET_PREFIX}/eqty-logo.svg`,
  favicon: `${BRAND_ASSET_PREFIX}/favicon.png`,
  /** An icon name, not a file. Removing it would leave 0.10 configs with `icon: undefined`, which passes silently. */
  github: 'simple-icons:github',
  ogImage: `${BRAND_ASSET_PREFIX}/og-image.jpg`,
} as const;

/** The edit row's icon. Sent to the page in the config, so it lives in one place. */
export const EDIT_ICON = 'lucide:pencil';
export const ISSUE_ICON = 'lucide:circle-dot';

export const ICON_NAME = /^(?:lucide|simple-icons):[a-z0-9]+(?:-[a-z0-9]+)*$/;

function iconNameProblem(value: string): string {
  if (value.includes('/') || value.endsWith('.svg')) {
    return `SVG files are no longer accepted as icons. Use an icon name: 'simple-icons:github' for logos, 'lucide:<name>' for everything else.`;
  }
  if (/^simple-icons:/i.test(value) && /[A-Z]/.test(value)) {
    return `Icon names are lowercase: use '${value.toLowerCase()}'.`;
  }
  if (/[A-Z]/.test(value)) {
    const suggestion = lucideNameFor(value.replace(/^lucide:/i, ''));
    return suggestion
      ? `Lucide names now include their set: use '${suggestion}'.`
      : `Lucide names now include their set, like 'lucide:book-open'. Find the name on lucide.dev/icons.`;
  }
  return `expected 'lucide:<name>' or 'simple-icons:<name>', got ${JSON.stringify(value)}`;
}

const iconName = z.string().superRefine((value, ctx) => {
  if (!ICON_NAME.test(value)) ctx.addIssue({ code: 'custom', message: iconNameProblem(value) });
});

/**
 * The link item every area that takes configured links shares: header and footer now, the table
 * of contents and sidebar later. Each area extends it rather than defining its own, so icons,
 * new-tab and sub-folder rules stay the same everywhere.
 */
export const navLink = z.object({
  label: z.string({ error: 'needs a label' }),
  href: z.string().optional(),
  icon: iconName.optional(),
  external: z.boolean().optional(),
});

const headerLink = navLink.extend({ href: z.string({ error: 'needs an href' }) });

const footerLink = navLink.extend({
  label: z.string({ error: 'needs a label' }).min(1, 'needs a label'),
  href: z.string().min(1, 'is empty; leave it out for a row without a link').optional(),
  prefix: z.string().optional(),
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

  // Removed in 0.11: without this key Zod drops a leftover `github` silently, and the site's
  // GitHub link disappears with no error.
  github: z
    .undefined({
      error:
        "github was removed. Add the link to header.links instead: { label: 'GitHub', href: 'https://github.com/owner/repo', icon: 'simple-icons:github', external: true }",
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
      /** Base URL for "Edit this page" in the article footer; the content path is appended. */
      editUrl: z.string().optional(),
      /** Where "Report an issue" in the article footer goes, after "Edit this page". */
      issueUrl: z.string().min(1).optional(),
      /** Site-wide rows in the app footer under the content: links, or plain information. */
      links: z.array(footerLink).default([]),
      showPrevNext: z.boolean().default(true),
      /** The license's name, such as "Apache 2.0". Shown as "Licensed under …" under the copyright. */
      license: z.string().min(1).optional(),
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
            /** The documented product's version, e.g. '4.0.0'. Defaults to the newest release in `source`. */
            current: z.string().optional(),
            /**
             * Where old versions come from. 'tags' (default): a copy of the docs at each release
             * tag, so pushing a tag is all it takes. 'folders': committed copies listed in
             * `folders`, saved by a release job, so the build needs no tags; the current release is
             * the highest folder. See the README's "Where old versions come from".
             */
            source: z.enum(['tags', 'folders']).default('tags'),
            /** Git tag glob for releases. Tags that are not MAJOR.MINOR.PATCH are skipped with a warning. */
            tags: z.string().default('v*'),
            /** One frozen copy per major, per minor, or per release. Releases without a copy redirect to theirs. */
            granularity: z.enum(['major', 'minor', 'patch']).default('major'),
            /**
             * Versions whose pages live in a folder rather than at their release tag, keyed by
             * release (`'2.2.0': 'archive/v2.2'`), paths relative to the project root. For releases
             * that predate the docs site: convert once, commit the folder.
             */
            folders: z.record(z.string(), z.string()).default({}),
          })
          .prefault({}),
      ],
      {
        // A union reports its own failure and drops the inner path, so a typo in `granularity`
        // would surface as "versions: Invalid input". Spelling the contract out here is what keeps
        // a misconfigured docsite failing loudly rather than silently versioning nothing.
        error:
          'expected false, or an object with optional current, source (tags | folders), tags, granularity (major | minor | patch) and folders',
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
