# @eqtylab/docs

An Astro documentation framework built on the [Equality](https://equality.eqtylab.io) design system.
One package to build every EQTY docs site — component library, product docs, and API reference —
with folder-driven navigation and versioned deploys.

## Quick start

```bash
pnpm add @eqtylab/docs @eqtylab/equality astro react react-dom
```

```js
// astro.config.mjs
import docs from '@eqtylab/docs';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://docs.example.com',
  base: process.env.DOCS_BASE ?? '/',
  integrations: [docs({ title: 'My Docs' })],
});
```

```ts
// src/content.config.ts  — required; Astro cannot inject collections
import { docsCollections } from '@eqtylab/docs/loaders';

export const collections = docsCollections();
```

Then write MDX under `src/content/docs/`. That's the whole setup: the integration injects the
page routes, a Markdown twin per page, `/llms.txt`, a search index, and a 404.

Content is **MDX-only**. Component overrides apply exclusively to MDX, so a `.md` page would
render its tables, code fences and callouts differently from every other page. A `.md` file in
the content tree fails the build rather than going silently missing — renaming it is usually the
only change needed, since MDX is a superset of Markdown.

## Navigation comes from folders

Ordering lives in one optional `_group.yaml` per directory — there is deliberately **no
`sidebar.order` frontmatter** to hand-maintain.

```yaml
# src/content/docs/getting-started/_group.yaml
label: Getting Started
order: [installation, usage, themes] # filesystem names, not titles
collapsed: false
```

- Children listed in `order` come first, in that order.
- Everything unlisted appends alphabetically by sidebar label (`sort: filename` or `manual` to change that).
- `index.mdx` in a folder becomes that folder's own landing page.
- A typo in `order` produces a build **warning naming the file and the token** rather than silently
  reordering, and the schema is `.strict()` so an unknown key fails the build.

## Two conventions worth knowing

**No Tailwind utility classes in this package's markup.** All styling goes through `@apply` in a
co-located `*.module.css` with a `@reference` header, mirroring `packages/ui`. This is not a style
preference: Tailwind v4's source detection skips `node_modules`, so utilities written literally in
shipped markup would silently produce nothing in a consumer's build. `@apply` has no such
dependency. `pnpm run check:no-utilities` enforces it and runs as part of `build`.

**Route-level MDX components override page-level ones.** `@astrojs/mdx` builds the map as
`{ Fragment, ...fileComponents, ...props.components }`, so the route's `<Content components={…} />`
wins over a page's own `export const components`. The route map is therefore kept to element
overrides (`a`, `pre`); everything richer is an explicit import from `@eqtylab/docs/components`, so
per-page overrides stay possible.

## Code blocks

Fenced code renders through Equality's `CodeBlock`, server-side, so docs match product surfaces with
**no client React**. `CodeBlock` has no state, and its `useInlineStyles={false}` means the palette
resolves from `--syntax-*` custom properties through the CSS cascade — so a static render gets
correct light _and_ dark colours for free.

Set `code: { highlighter: 'shiki' }` to use Astro's Shiki instead: wider language coverage, line
highlighting and `meta` support, at the cost of a different look from the product.

## Everything renders through Equality

The framework contributes layout, navigation and prose typography. Everything that renders
_content_ is an Equality component, server-rendered with no client React, so docs and
product surfaces cannot drift:

| Authored as     | Renders as                                                                              |
| --------------- | --------------------------------------------------------------------------------------- |
| Code fences     | `CodeBlock`                                                                             |
| Markdown tables | `TableContainer` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` |
| `<Alert>`       | `Alert`, as an `aside`                                                                  |
| Links           | base-aware `a` override                                                                 |

**Authors write Equality's own components, with no imports.** The route-level component map
supplies named components as well as element overrides, so this works in any page with
nothing at the top of the file — there is no docs-specific component vocabulary to learn:

```mdx
---
title: My page
---

<Alert variant="warning" title="Heads up">
  Body content, with real block elements.
</Alert>
```

The only thing the framework adds is a default: `as="aside"`. Alert's default `div` carries
`role="alert"`, an assertive live region — right for a message responding to something the
user did, wrong for a standing note in a document. Importing `Alert` from
`@eqtylab/equality` explicitly opts out and gives you the raw component, because a
file-level import wins over the component map.

One detail worth knowing: **tables need a column count.** `TableContainer` is a CSS grid
whose parts all use `subgrid`, so it needs an explicit track list or the table collapses
to one column. Markdown has no syntax for that, so `rehypeTableColumns` derives the count
from the first row at build time.

This is also why content is MDX-only — these overrides are the mechanism, and Astro's
plain-Markdown pipeline has no component substitution at all.

## Versioned deploys

`base` must be literal in Astro's config at build time, so it is threaded by environment variable:

| Variable            | Meaning                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `DOCS_BASE`         | Astro's `base` — `/`, `/v3.1/`, `/repo/v3.1/`                              |
| `DOCS_VERSION_ROOT` | Directory holding all version directories (tracked separately from `base`) |
| `DOCS_VERSION`      | This build's version id, e.g. `3.1`                                        |
| `DOCS_IS_LATEST`    | `true` for the canonical build served at root                              |

Every internal URL flows through `@eqtylab/docs/paths`, and authored markdown links are rewritten by
a rehype plugin — Astro does not do this itself, so without it every root-relative link in content
would 404 in a sub-path build.

## Development

```bash
pnpm build    # guard + node bundle + runtime copy + declarations
pnpm test     # nav ordering, prev/next, breadcrumbs, TOC
```

`src/*.ts` is bundled for Node (it is loaded when Astro reads your config). `src/runtime/**` ships
as **source** and is compiled by the consumer's Astro — `.astro` files cannot be bundled. The copy is
verbatim, which is what keeps dev source-linking byte-equivalent to the published package.

### The playground

`pnpm dev` serves `playground/` on port 4322 — a standalone site with test content, used to
develop the framework itself. It is **not published** (the `files` field ships only `dist/` and
`README.md`) and **not deployed**. Its content doubles as a live spec: every page exercises a
convention, so if something looks wrong on screen the framework is wrong, not the content.

Edits to `src/runtime/**` hot-reload — `scripts/dev.mjs` keeps `dist/runtime` in sync, which is
what Vite actually serves (Astro resolves injected route entrypoints through the real exports map).

To exercise a versioned sub-path build:

```bash
DOCS_BASE=/v0.0/ pnpm playground:build
```

Then confirm nothing 404s when `playground/dist` is served at `/v0.0/`.

### Fixtures

`tests/fixtures/basic` is a separate, deliberately minimal consumer used for assertions — it
contains a misspelled `_group.yaml` key on purpose, which is why it is kept apart from the
playground rather than doubling as the dev surface.
