# Changelog

Notable changes to Equality's Docsite Generator are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

## 0.13.1 - 2026-10-09

### Changed

- Headings and vertical spacing go back to 0.12's: h2 20px with 80px above, h3 16px with 48px
  above, h4 to h6 14px with 24px above, 64px under the page header's rule, and 96px above the
  article footer with 48px above its rule. Hierarchy comes from weight and the mono label, not
  heading size
- A label sits 24px above its first h3, as on Tailwind's docs, so it reads as part of the group
  below; it was 48px in 0.12 and 12px in 0.13.0
- The page header's 64px now applies when the page opens with a heading; before 0.13.0 the
  heading's own 80px overrode it
- Code blocks, tables, alerts and rules keep 0.13.0's 24px below, matching the gap between
  paragraphs

## 0.13.0 - 2026-10-08

### Added

- `template: landing`: a page with the sidebar but no outline, that renders its frontmatter
  `sections` as cards in place of the body. Each section has a `heading` and `cards`, and each card
  a `title`, `description` and `links` as `[label, href]`
  - `/` links stay inside an old version's copy; full URLs open a new tab
  - The build stops when a landing page has no `sections` or has a body, and when another page
    has `sections`. Every card needs a description and at least one link
  - Its Markdown twin lists the sections as links; search leaves it out
- `components/Landing.astro`: the same landing page for a site's own `src/pages/index.astro`
- `feedback`: a URL for "Report a problem with this page", such as a support portal, in place
  of the repository's new-issue page. It works without `repository`, for sites whose repo is
  private
- `refresh` on the version switcher's data: a URL serving the same shape, fetched on load, so a
  frozen copy can list versions released after it
- Inter and IBM Plex Mono are loaded, so pages render in them without the reader having them
  installed. Inter is the sans stack's fallback after TWK Lausanne, a licensed face this package
  can't ship. A site that loads them itself can drop its own copy
- Page loads cross-fade where the browser supports it, with the header and sidebar held still

### Changed

- "On this page" shows on every doc page, led by the page title linking to the top, so a page with
  no headings keeps the column
  - `DocsPage` shows it unless `showToc` is `false`, even with an empty `toc`; a page of your own
    without an outline passes `showToc={false}`
- Headings are larger: h2 24px, h3 20px, h4 16px, so h2 to h4 are never smaller than body text
- Tighter vertical spacing: 48px above an h2 and above the article footer, 32px above an h3 to h6,
  24px below code blocks, tables, alerts and rules, 32px under the page header's rule, and 32px on
  both sides of the article footer's
- The article footer reads "Edit this page" and "Report a problem with this page", without the
  "Spotted a mistake?" and "Something broken?" lead-ins
- The app footer's copyright and license align right
- Sidebar labels wrap instead of being cut off
- Verifiable Compute's row in the site menu reads "Verifiable builds and confidential workloads",
  short enough for one line like the others

### Fixed

- The sidebar keeps its scroll position across page loads, instead of jumping back to the top
- The phone menu opens scrolled to the current page

## 0.12.0 - 2026-10-07

### Added

- `repository: { url, branch }`: the site's GitHub repository. Every article ends with "Spotted a
  mistake? Edit this page" and "Something broken? Report an issue", side by side, worked out from
  it; the page's path in the repo is read from git
- `license`: the project's license, such as "Apache 2.0", shown with a scale icon under the
  copyright in the app footer
- `footer.links`: rows in the app footer, shaped like header links, with a lead-in `prefix`; a row
  without `href` is plain text
- Icons are named with their set, `lucide:<name>` or `simple-icons:<name>`, in header links and
  footer rows
  - Both sets come with the package, Simple Icons for logos
  - Icons follow the text colour in both themes
  - A name that doesn't exist stops the build and says which
- Header and footer links that open a new tab say so to screen readers
- A card at the top of the sidebar names the site and switches between EQTY Lab's public docs
  sites, each row saying what the site is for. A site not on the public list (`eqtyDocsSites`) sits
  at the top of its own menu, so new and private sites need no setup
- Phones get the same card at the top of the menu

### Changed

- The page footer is split in two. The article footer, under the prose, keeps the previous and
  next links, "Edit this page" and the new issue link. An app footer, holding `footer.links`, runs
  under the article and table of contents on every page, splash pages too
- Header links starting with `/` get the site's sub-folder, by the same rule as links in page text
- The header reads "[logo] | Docs" on every site; the site name moved to the sidebar card, so a
  long name no longer runs into the search box
- The version menu opens from its own row under the site name instead of the header; on phones it
  replaces the version list in the menu
- With `logo: false` the header shows `title` as text, then "Docs"
- Below 360px the header shows the logo without "Docs", so nothing runs into the search button

### Fixed

- The brand link, header links and theme toggle show Equality's focus ring instead of the
  browser's outline
- "On this page" highlights the last section at the bottom of the page, even when that section is
  too short to scroll its heading up to the top

### Removed

- `footer.editUrl`: set `repository` instead; a leftover `editUrl` stops the build and says so
- `footer.text`: the app footer always ends with "© <year> EQTY Lab", and a leftover `text` is
  ignored
- The `github` option and the automatic GitHub link: write it in `header.links`, as the README's
  quick start does; a leftover `github` stops the build and shows the link to write
  - Links to github.com no longer get the GitHub icon added; they show the icon you give them
- Lucide names without a set, such as `BookOpen`: write `lucide:book-open`; the build error names
  the replacement
- SVG files as icons, such as `/github.svg`
- The `/_equality/github.svg` file; `brandAssets.github` is now `'simple-icons:github'`
- `chrome/VersionSwitcher.tsx` and `Header`'s `switcher` prop: the version menu lives in the
  sidebar card

## 0.11.0 - 2026-10-07

### Changed

- Requires Astro 7: `astro` 7.2.10 or later, `@astrojs/mdx` 8 and `@astrojs/react` 7
- The remark and rehype plugins run on a `unified` processor from `@astrojs/markdown-remark`: the
  site's own when it sets one, otherwise a new one. Sätteri, Astro 7's default, runs neither
- `gfm` and `smartypants` are set on that processor, not on `config.markdown`

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
