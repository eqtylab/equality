/** `z` must come from `astro/zod`: a different zod instance breaks Astro's collection validation. */
import { z } from 'astro/zod';

export const badgeSchema = () =>
  z.object({
    text: z.string(),
    variant: z
      .enum(['primary', 'secondary', 'neutral', 'success', 'warning', 'danger'])
      .default('neutral'),
  });

const deprecatedSchema = () =>
  z.union([
    z.boolean(),
    z.object({
      message: z.string().optional(),
      replacedBy: z.string().optional(),
    }),
  ]);

const tocSchema = () =>
  z.object({
    minLevel: z.number().int().min(1).max(6).default(2),
    maxLevel: z.number().int().min(1).max(6).default(3),
  });

/** Page frontmatter. Ordering lives in `_group.yaml`, not here. */
export function docsSchema() {
  return z.object({
    title: z.string(),
    description: z.string().optional(),
    /** Overrides `title` in the sidebar only. */
    navLabel: z.string().optional(),
    /** Lucide icon name. */
    icon: z.string().optional(),
    badge: badgeSchema().optional(),
    /** Omit from the sidebar. The page still builds and is still reachable. */
    hidden: z.boolean().default(false),
    /** Excluded from builds entirely, but visible in `astro dev`. */
    draft: z.boolean().default(false),
    deprecated: deprecatedSchema().default(false),
    /** 'doc' gets sidebar + TOC; 'splash' is full-bleed with neither. */
    template: z.enum(['doc', 'splash']).default('doc'),
    tableOfContents: z.union([tocSchema(), z.literal(false)]).optional(),
    /** Opt out of the markdown twin and the search index for this page. */
    noIndex: z.boolean().default(false),
    prev: z.union([z.boolean(), z.string()]).optional(),
    next: z.union([z.boolean(), z.string()]).optional(),
  });
}

export const groupLinkSchema = () =>
  z.object({
    label: z.string(),
    href: z.string(),
    /** Inferred from the href when omitted. */
    external: z.boolean().optional(),
    icon: z.string().optional(),
    badge: badgeSchema().optional(),
    attrs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  });

/** `_group.yaml`. `.strict()` is load-bearing: a typo in an ordering file must fail, not be ignored. */
export function groupSchema() {
  return z
    .object({
      label: z.string().optional(),
      icon: z.string().optional(),
      /** Immediate-child filesystem names (not titles), in display order. */
      order: z.array(z.string()).default([]),
      /** Label for the row linking to this folder's own `index.mdx`. Defaults to `sidebar.indexLabel`. */
      indexLabel: z.string().optional(),
      /** Children absent from `order`: alpha by label (default), by filename, or manual (dropped from the sidebar). */
      sort: z.enum(['alpha', 'filename', 'manual']).optional(),
      collapsed: z.boolean().optional(),
      hidden: z.boolean().default(false),
      badge: badgeSchema().optional(),
      links: z.array(groupLinkSchema()).default([]),
    })
    .strict();
}

export type DocsFrontmatter = z.infer<ReturnType<typeof docsSchema>>;
export type GroupFrontmatter = z.infer<ReturnType<typeof groupSchema>>;
