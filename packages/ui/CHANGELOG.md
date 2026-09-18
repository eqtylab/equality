# Changelog

Notable changes to Explorer are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 4.1.0

Scrollable areas are now browser-native. Equality no longer ships a synthetic scrollbar or a scrollbar-restyling utility.

### Removed

- The `styled-vertical-scrollbar` and `styled-horizontal-scrollbar` utility
  classes, and the `theme-components.css` file.

### Deprecated

- `ScrollArea` and `ScrollBar`. Use a native scrollable element instead — set an overflow and a height on your own container and leave the scrollbar unstyled.

### Changed

- `DialogBody` and `SheetBody` scroll with the native scrollbar rather than the removed utility class.
- The `equality-design-system` skill tells agents to use native scroll containers and not to restyle scrollbars.
