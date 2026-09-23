# Changelog

Notable changes to Equality are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 4.2.0 - 2026-09-23

Scrollable areas are now browser-native. Equality no longer ships a synthetic scrollbar or a scrollbar-restyling utility.

### Added

- `SelectSearch` and `SelectEmpty`, bringing `DropdownMenu`'s opt-in, in-place search to
  `Select`. `SelectItem` matches on its `textValue`, falling back to its rendered text.

### Removed

- The `styled-vertical-scrollbar` and `styled-horizontal-scrollbar` utility
  classes, and the `theme-components.css` file.

### Deprecated

- `ScrollArea` and `ScrollBar`. Use a native scrollable element instead — set an overflow and a height on your own container and leave the scrollbar unstyled.

### Changed

- Dialogs and Sheets now scroll with native scrollbars.
