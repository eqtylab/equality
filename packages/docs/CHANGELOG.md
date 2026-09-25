# Changelog

Notable changes to Equality's Docsite Generator are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 0.5.0 - 2026-09-24

### Added

- EQTY Lab brand files ship with the package
  - The mark, favicon and GitHub icon are served at `/_equality/*.svg`, exported as `brandAssets`
  - Opt in with `logo: { src: brandAssets.logo }` or a header link's `icon: brandAssets.github`

### Changed

- The favicon defaults to the shipped EQTY Lab one, so a site no longer needs its own `public/favicon.svg`
  - A site that sets `favicon` keeps its own

## 0.4.0 - 2026-09-22

### Added

- Git tag-based documentation versioning
  - Git tags are now accounted for by docsites and old tagged versions can be selected in the UI

### Changed

- Overview pages in the navigation sidebar are now separate from their section heading
