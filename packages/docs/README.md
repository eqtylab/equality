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

## Linking between pages

Write the link the way the file sits on disk and it resolves to that page's URL:

```mdx
See [usage](./usage.mdx) and [the guides index](../guides/index.mdx#ordering).
```

`./usage.mdx` becomes `/getting-started/usage/`, with `base`, `pathPrefix` and the trailing slash
applied exactly as the sidebar applies them. A `.md` target finds the `.mdx` file of the same name,
so markdown synced in from a product repo needs no rewriting, and a folder's `index.mdx` resolves to
the folder. A target that names no page in the content directory is a build **warning naming the
file and the href** — it still rewrites, so the typo shows up in the log rather than only as a 404.

Only content files are rewritten, and only targets that land inside the content directory: a
relative link out of the collection is someone else's URL to own. Root-relative links are
base-prefixed instead — Astro does not do that for authored markdown — and extensionless relative
links are left to the browser.

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
| `<Tabs>`        | `Tabs`, server-rendered                                                                 |
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

Tabs are authored the same way, with no imports:

```mdx
<Tabs syncKey="platform">
  <TabItem label="Linux">Anything, including fences and tables.</TabItem>
  <TabItem label="macOS">
    Sets sharing a `syncKey` switch together, and the choice is remembered.
  </TabItem>
</Tabs>
```

This is also why content is MDX-only — these overrides are the mechanism, and Astro's
plain-Markdown pipeline has no component substitution at all.

## Bringing your own CSS and scripts

`customCss` and `clientScripts` attach a consumer's own assets to every docs page:

```js
docs({
  title: 'My Docs',
  customCss: ['./src/styles/site.css'],
  clientScripts: ['./src/scripts/glossary.ts'],
});
```

Both resolve project-relative paths against the project root, so they mean the same thing in
dev and in a build. `clientScripts` entries are **bundled** rather than served as-is, which is
what a script that rewrites rendered text needs: it has to import `scheduleHighlight` from
`@eqtylab/equality` and call it afterwards, or the code blocks it touched lose their
highlighting. (`CodeBlock` paints through the CSS Custom Highlight API over `Range`s into those
very text nodes.) A plain `<script src>` in `public/` cannot import anything.

## Owning a page yourself

A file in your own `src/pages` wins. The integration sees the route is already claimed, logs that
it is yielding, and injects nothing there — so a landing page is yours to write, with the same
chrome every other page gets:

```astro
---
import Prose from '@eqtylab/docs/chrome/Prose.astro';
import DocsPage from '@eqtylab/docs/layouts/DocsPage.astro';
import { docsNav } from '@eqtylab/docs/lib/nav-data.ts';

// `nav` is required: the sidebar, the drawer and the 404's suggestions all read it.
const nav = await docsNav(Astro.url.pathname);
---

<DocsPage title="Home" nav={nav} toc={[]} showToc={false} splash>
  <Prose title="Home">Anything at all.</Prose>
</DocsPage>
```

`@eqtylab/docs/lib/*` ships the rest of what the injected route uses, with the collection already
wired in: `docsEntries` and `pathContext` alongside `docsNav` in `nav-data.ts`, `breadcrumbsFor` /
`prevNextFor` / `buildTocTree` re-exported from there, and `mdxComponents` in `mdx-components.ts`
for rendering a collection entry through the same component map.

## Building the Search Index

Full-text search uses the built HTML, via [Pagefind](https://pagefind.app). The integration
runs it in `astro:build:done` and writes the index to `dist/pagefind/`.

RUn `pnpm run build` to make search work in `pnpm run dev`. Dev serves `dist/pagefind/` off disk,
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

## Versions

On by default. With release tags in the repository (`v1.2.3`, one per release), the build makes
one frozen copy of the docs per older group and serves it under `/v<group>/`, adds a switcher to
the header, a banner and `noindex` to every old page, and scopes search to the page's version.
Every release tag that is not a copy of its own redirects to its group's copy. Without tags it
is dormant and the build is unchanged.

```js
docs({
  versions: {
    current: '4.0.0', // defaults to the highest matching tag
    tags: 'v*', // git tag glob; tags that are not MAJOR.MINOR.PATCH are skipped
    granularity: 'minor', // 'major' (default) | 'minor' | 'patch'
  },
});
// or
docs({ versions: false });
```

What to know:

- `current` is never read from your `package.json`. Set it from the product you document, or
  leave it to the highest tag.
- Only `MAJOR.MINOR.PATCH` tags count. Prereleases and other shapes are skipped with a warning.
- CI needs the tags: check out with `fetch-depth: 0`.
- If a tag lands one deploy after its bump and `current` is inferred, the `/` label is one
  release behind for that deploy. The content is current; the label heals on the next tag.
- An archived page is a document, not an app. Prose, headings, tables and code samples are
  kept; live component examples are not rendered, because an old page's imports bind it to
  today's library. The banner says so.
- Old versions are read-only. A wrong page is fixed by a new tag.
- Moving `granularity` between `minor` and `patch` does not break published URLs: every grouping
  coarser than the one you set also resolves, so `/v3/` and `/v3.9/` both work at either setting.
  Moving **to `major` does** break them. Only groupings at or coarser than the setting are emitted,
  so at `major` nothing emits `v3.9` and every published `/v3.9/` URL retires.

The `DOCS_BASE` family of environment variables still exists for consumers who deploy each
version as a separate build under its own `base`; this feature does not use them.

## Development

```bash
pnpm build    # guard + node bundle + runtime copy + declarations
pnpm test     # nav ordering, prev/next, breadcrumbs, TOC, prose scope, link resolution
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
