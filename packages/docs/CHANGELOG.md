# Changelog

Notable changes to Equality's Docsite Generator are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

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
