# Changelog

Notable changes to Equality's Docsite Generator are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.5.2 - 2026-09-25

### Fixed

- The Markdown twin, "Copy as Markdown" and "View as Markdown" carry a page's imported content
  - A tag that includes another `.mdx` or `.md` file is replaced by that file's text, and
    `<CodeFence code={…} />` fed by a `?raw` import becomes a fenced block in its language,
    instead of the bare import and tag
  - A page with no such imports produces the same output as before
  - A tag that should expand but cannot, such as an included file that cannot be read, is named in a build warning
- The home page's `llms.txt` link points at its `index.md` twin, not a URL like `https://example.com.md`

## 0.5.1 - 2026-09-25

### Added

- EQTY Lab brand files ship with the package
  - The mark, favicon and GitHub icon are served at `/_equality/*.svg`, exported as `brandAssets`
  - Opt in with `logo: { src: brandAssets.logo }` or a header link's `icon: brandAssets.github`

### Changed

- The favicon defaults to the shipped EQTY Lab one, so a site no longer needs its own `public/favicon.svg`
  - A site that sets `favicon` keeps its own

## 0.5.0 - 2026-09-25

### Added

- `docs({ plugins })` is now invoked. A plugin's `setup` runs inside `astro:config:setup` with
  the raw hook params, its `addNavGroup` groups land in `sidebar.extra`, and its
  `addMdxComponents` entries — module specifiers, imported through the new
  `virtual:eqty-docs/plugin-components` module — merge into the route-level MDX component map.
  The option and the `DocsPlugin` type existed in 0.4.0 but nothing called them.

### Changed

- `DocsPluginContext.addMdxComponents` takes `Record<string, string>` (module specifiers), not
  `Record<string, unknown>`.

## 0.4.0 - 2026-09-22

### Added

- Git tag-based documentation versioning
  - Git tags are now accounted for by docsites and old tagged versions can be selected in the UI

### Changed

- Overview pages in the navigation sidebar are now separate from their section heading
