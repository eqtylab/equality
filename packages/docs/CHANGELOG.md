# Changelog

Notable changes to Equality's Docsite Generator are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

### Added

- `footer.issueUrl`: "Something broken? Report an issue" in the article footer, after "Edit this
  page"

### Changed

- The page footer is split in two. The article footer, under the prose, keeps the previous and
  next links, "Edit this page" and the new issue row. `footer.links` and `footer.text` move to an
  app footer that runs under the article and table of contents on every page, splash pages too
- A "Something broken?" row in `footer.links` now shows in the app footer: move its `href` to
  `footer.issueUrl` to keep it at the end of the article
- Footer links no longer get a full stop added after them

## 0.11.0 - 2026-10-06

### Added

- `footer.links`: footer rows after "Edit this page", shaped like header links, with a lead-in
  `prefix`; a row without `href` is plain text
- Icons are named with their set, `lucide:<name>` or `simple-icons:<name>`, in header links and
  footer rows
  - Both sets come with the package, Simple Icons for logos
  - Icons follow the text colour in both themes
  - A name that doesn't exist stops the build and says which
- Header and footer links that open a new tab say so to screen readers

### Changed

- "Edit this page" and any `footer.links` rows sit below a rule at the end of the page, one per line
  with an icon; `footer.text` follows them, left-aligned
- The page footer has 64px more space below it
- Header links starting with `/` get the site's sub-folder, by the same rule as links in page text

### Removed

- The `github` option and the automatic GitHub link: write it in `header.links`, as the README's
  quick start does; a leftover `github` stops the build and shows the link to write
  - Links to github.com no longer get the GitHub icon added; they show the icon you give them
- Lucide names without a set, such as `BookOpen`: write `lucide:book-open`; the build error names
  the replacement
- SVG files as icons, such as `/github.svg`
- The `/_equality/github.svg` file; `brandAssets.github` is now `'simple-icons:github'`

## 0.10.1 - 2026-10-06

### Fixed

- "On this page" highlights the current section in lilac on pages whose headings have no
  sub-sections too; it showed white, or nothing, in Chrome

## 0.10.0 - 2026-09-30

### Added

- `versions.source`: where old versions come from, `'tags'` (default, unchanged) or `'folders'`
  - `'folders'`: old versions and the current release come from the committed `folders`, saved by a release job, so the build needs no tags and every host builds the same versions when every older version has a folder. For versions a tag cannot carry: content made by the release build, tags in another repository, hosts without tags such as Vercel
  - Where tags are present, a tag above the highest folder and an older version copied from a tag are each named in a warning
  - A folder above every release tag in the clone is named in a warning, flagging a mistyped key. A warning, not a failure: a full-history clone can hold only some tags
  - Works without a `.git` directory, and no longer prints the shallow-clone warning
- README: "Where old versions come from" explains the two sources and when to pick each

### Changed

- Folder keys and directories are validated before the dormant check
- The dormant warning for listed folders suggests `source: 'folders'`

### Fixed

- The "tags above current" warning no longer prints the internal `folder:` prefix

## 0.9.0 - 2026-09-30

### Added

- `versions.folders`: serve a version's pages from a folder, for releases that predate the docs site
  - Keys are releases (`'2.2.0'`), values folder paths relative to the project root
  - A folder replaces its release's tag copy when the tag has pages too
  - A folder for the current release waits, and is served once a newer release ships
  - The build fails if a folder is missing, its key is not `MAJOR.MINOR.PATCH`, or it is not the
    newest release of its group
  - The build warns if a folder in the current group is not the current release, or if folders
    are listed while versioning is dormant

### Fixed

- Relative links between pages (`./usage.mdx`) resolve in archived versions too, to that
  version's page; they reached the browser unchanged

## 0.8.0 - 2026-09-28

### Changed

- Bold text and links in prose are semibold, and links underline in the link colour
- Prose has more room: 24px between blocks, 48px above an h3, 80px above an h2
- Headings are smaller and lean on weight: h2 is 20px, h3 16px, h4 and h5 14px
- An h2 followed directly by an h3 renders as a small mono uppercase label
  - Any text between them keeps the h2 a normal heading
- The breadcrumb, "On this page", top-level sidebar groups and the menu's version label share
  that label style

### Fixed

- The breadcrumb passes contrast in light mode
- Hovering a link in light mode no longer drops it below contrast; hover uses the link colour token

## 0.7.0 - 2026-09-25

### Changed

- The GitHub link's address comes only from the `github` option in the Astro config
  - The site's `package.json` `repository` field is no longer read; a site that relied on it links
    to `https://github.com/eqtylab` until it sets `github: 'owner/repo'`
  - `github` takes `owner/repo` or a github.com URL; the `github:owner/repo` and git URL forms are gone

### Fixed

- A GitHub link a site writes in `header.links` without an icon gets the GitHub icon
  - A site's own icon on that link is kept

## 0.6.0 - 2026-09-25

### Changed

- The header shows the EQTY Lab logo and a GitHub link by default
  - `logo: false` and `github: false` turn them off; a site's own `logo` still replaces the mark
  - Sites that upgrade will see both appear with no config change
- Below 640px the header drops the logo and shortens a long title with "…"
  - Before, a long title, or any title beside the logo at 320px, pushed the menu button off screen

### Added

- A `github` option for the header's GitHub link
  - Unset, it links to the `repository` field of the site's `package.json`, else `https://github.com/eqtylab`
  - A GitHub URL or `owner/repo` overrides both; anything else fails the build, naming the value
  - A header link the site already has to `github.com` replaces it, so the link never shows twice
- Shared links get a preview card: every page carries Open Graph and Twitter card tags
  - The picture defaults to EQTY Lab's 1200×630 share image; `ogImage` replaces it, `false` removes it
  - The picture and page URL need Astro's `site`, since preview apps only accept full URLs

### Fixed

- The default favicon is EQTY Lab's, the one eqtylab.io uses, instead of Astro's logo
  - A 32px PNG served at `/_equality/favicon.png`; `brandAssets.favicon` points there

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
