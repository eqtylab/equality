/** Integration options: the whole consumer-facing configuration surface. */
import { z } from 'astro/zod';

const headerLink = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
  external: z.boolean().optional(),
});

export const docsConfigSchema = z.object({
  /** Site name, shown in the header and used as the `<title>` suffix. */
  title: z.string(),
  description: z.string().optional(),
  /** Path to a favicon, relative to `public/`. Base is applied automatically. */
  favicon: z.string().default('/favicon.svg'),

  logo: z
    .object({
      src: z.string(),
      alt: z.string().default(''),
      /** Hide the text title when a logo is present. */
      replacesTitle: z.boolean().default(false),
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
      /**
       * Fenced code renders through Equality's `CodeBlock`, server-side, so it
       * matches product surfaces with no client React. Set `highlighter: 'shiki'`
       * to use Astro's Shiki instead -- wider language coverage, line
       * highlighting and `meta` support, at the cost of a different look.
       */
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
      /** 'pagefind' indexes built HTML; 'titles' is a lightweight JSON index. */
      provider: z.enum(['pagefind', 'titles', 'none']).default('pagefind'),
      /** Pagefind needs a build, so dev falls back to the titles index. */
      devProvider: z.enum(['titles', 'none']).default('titles'),
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

  /** Install @astrojs/mdx, @astrojs/react and Tailwind when absent. */
  autoIntegrations: z.boolean().default(true),

  /** Versioning. Left permissive here; the versioning workstream owns the shape. */
  versions: z.any().optional(),

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
