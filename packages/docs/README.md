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
page routes, a Markdown twin per page, `/llms.txt`, and a 404. Search is built separately, at the
end of `astro build`; see [Search needs a build](#search-needs-a-build).

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

## Three conventions worth knowing

**Styling is inline Tailwind, and one `@source` line is what makes it work.** The chrome is styled
with utility classes written in the markup. That only compiles because `runtime/styles/docs.css`
names this package's own files in an explicit `@source`: Tailwind v4's automatic source detection
skips `node_modules`, which is exactly where this markup sits in a consumer's build. Drop that line
and every utility here produces nothing, with no error anywhere. `pnpm run check:source` enforces
that the glob still covers all shipped markup, and runs as part of `build`. Recipes used by more
than one component are `@utility` definitions in `runtime/styles/utilities.css`; a co-located
`*.module.css` is the escape hatch for rules that cannot live on an element, which today means
only `GlobalSearch.module.css`.

**Overruling an Equality component takes `!`.** `packages/ui` ships unlayered CSS, Tailwind
utilities live in `@layer utilities`, and an unlayered declaration beats a layered one whatever its
specificity. So where this markup has to overrule a value an Equality class already sets on the
same element — `CodeBlock`'s `max-height`, `CommandList`'s — the utility carries `!`. Properties
Equality leaves alone need nothing. Getting this wrong fails silently: the class is in the HTML and
the rule is in the bundle, it just loses.

**Route-level MDX components override page-level ones.** `@astrojs/mdx` builds the map as
`{ Fragment, ...fileComponents, ...props.components }`, so the route's `<Content components={…} />`
wins over a page's own `export const components`. The route map is therefore kept to element
overrides (`a`, `pre`); everything richer is an explicit import from `@eqtylab/docs/components`, so
per-page overrides stay possible.

## Code blocks

Fenced code renders through Equality's `CodeBlock`, server-side, so docs match product surfaces with
**no client React**. The highlighter paints through the CSS Custom Highlight API rather than by
wrapping tokens in markup, so the server-rendered DOM is the final DOM, the palette resolves through
the normal cascade, and a static render gets correct light _and_ dark colours for free.

Two small scripts do what would otherwise need hydration: `runtime/scripts/eq-copy.ts` for the copy
button, and `runtime/scripts/eq-highlight.ts` to start the highlight pass. Fence tags are passed
through as authored — the highlighter owns language resolution, including its alias table (`ts`,
`jsx`, `sh`, `yml` and the rest), and renders plain rather than guessing at a tag it does not know.

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

## Search needs a build

Search is full-text, over the built HTML, via [Pagefind](https://pagefind.app). The integration
runs it in `astro:build:done` and writes the index to `dist/pagefind/`.

**One `astro build` makes search work in `astro dev` too.** Dev serves `dist/pagefind/` off disk,
so results describe the last build; rebuild while dev runs and the next search picks it up. Until
that first build the palette says search needs one.

What gets indexed is set by the markup, not by config:

| Attribute              | Where                            | Effect                                |
| ---------------------- | -------------------------------- | ------------------------------------- |
| `data-pagefind-body`   | the `<article>`                  | Bounds the index to page content      |
| `data-pagefind-ignore` | header, sidebar, TOC, action row | Keeps chrome out of every result      |
| `data-pagefind-meta`   | the `<h1>` and the `<article>`   | Carries `title` and the `group` label |

The `group` value is the section's `label` from `_group.yaml`, so search headings and the sidebar
cannot drift apart.

The control itself is a command palette in the header, opened by click, `⌘K` or `/`. Fill the
header's `search` slot to replace it, or set `search.provider: 'none'` to drop it entirely.

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

### The dev surface

`packages/demo` — the Equality docs site — is the first-class consumer, so the framework is
developed against the same site that ships. Run `pnpm dev` from the repo root: this package's
`dev` keeps `dist/runtime` in sync while the demo serves on port 4321.

The sync is what makes edits to `src/runtime/**` hot-reload. Astro resolves injected route
entrypoints through the real exports map, so `dist/runtime` — not `src/runtime` — is what Vite
actually serves. Changes to `src/*.ts` are a different matter: they are bundled by tsup and read
by Astro at config time, so they need `pnpm build:node` and a dev-server restart.

To exercise a versioned sub-path build:

```bash
DOCS_BASE=/v0.0/ pnpm --filter demo build
```

Then confirm nothing 404s when `packages/demo/dist` is served at `/v0.0/`.

### Fixtures

`tests/fixtures/basic` is a separate, deliberately minimal consumer used for assertions — it
contains a misspelled `_group.yaml` key on purpose, which is why it is kept apart from the demo
rather than doubling as the dev surface.
