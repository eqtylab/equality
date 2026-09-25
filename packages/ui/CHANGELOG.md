# Changelog

Notable changes to Equality are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 4.5.1 - 2026-09-25

### Fixed

- The search box in a searchable `Select` or `DropdownMenu` stays at the top of the list while
  it scrolls. In a `Select` it scrolled away with the options, and in a `DropdownMenu` it was
  never pinned.
- <kbd>↓</kbd> on the last option of a searchable `Select` or `DropdownMenu` scrolls the list back
  to the top as it returns to the search box. The list stayed scrolled to the bottom.

## 4.5.0 - 2026-09-25

### Added

- Segmented controls now have `sm`, `md`, and `lg` `size` variants

## 4.4.2 - 2026-09-25

### Fixed

- A `Select` list is now exactly as wide as its trigger, not 10px wider. Options wider than the
  trigger still widen it.
- A `Select` list scrolls with a native scrollbar. The scroll arrows are gone: the down arrow
  stayed up after a search emptied the list, and the up arrow sat above the search box.
- In a searchable `Select` or `DropdownMenu`, <kbd>↓</kbd> on the last option returns to the
  search box, as <kbd>↑</kbd> on the first already did.
- A searchable `Select` or `DropdownMenu` near the edge of the screen stays on screen while
  searching. Locking its side also turned off collision handling, so the list shifted back to
  its unadjusted position, partly off screen, until it reopened.
- `FilterDropdown` options no longer wrap onto a second line. The menu widens from `w-56` up to
  `max-w-80` to fit them, and a longer label ends in an ellipsis, with the full label in its
  tooltip.

### Removed

- `SelectScrollUpButton` and `SelectScrollDownButton`. `SelectContent` owns the element they
  must sit in, so they could only ever be rendered by `SelectContent` itself.

## 4.4.1 - 2026-09-25

### Fixed

- Toasts dismiss on their own again after a toast is closed while hovered. The hover pause
  stuck on, so every later toast stayed until closed by hand.
- A toast shown before a `Sheet` or `Dialog` opened can now be closed while it is open.
- The toast close button has an accessible name.

## 4.4.0 - 2026-09-25

### Added

- A `persistent` prop on `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`,
  `DropdownMenuSeparator`, `SelectItem` and `SelectSeparator`. The item stays visible while
  searching but is never a result: it doesn't count towards the empty state or the result count,
  and <kbd>Enter</kbd> in the search box skips it.
- `useDropdownMenuSearchQuery` and `useSelectSearchQuery`, returning the `query`, `isSearching`
  and a `matches` function for components inside a `DropdownMenu` or `Select` that act on what
  the search shows.

### Changed

- `DropdownMenuSearch` shows its search box on open by default, as `SelectSearch` does. Pass
  `alwaysVisible={false}` to keep revealing it on the first keystroke.
- A searchable `FilterDropdown` keeps "Clear all" visible while a query is typed. It no longer
  leaves an empty strip at the bottom of the menu.

### Fixed

- A searchable `DropdownMenu`, and so `FilterDropdown` and `RadioDropdown`, keeps the side it
  opened on while searching, as `Select` does since 4.3.2.
- <kbd>Backspace</kbd> while a `DropdownMenu` item has focus keeps editing the search query, as
  it does in `Select`.
- A searchable `DropdownMenu` inside a `Dialog` reliably focuses its search box when opened.
  4.3.1 recovered focus only on the menu's first focus event, which the search input could
  claim before the dialog's focus trap pulled focus back out.

## 4.3.2 - 2026-09-24

### Fixed

- `FilterDropdown`'s "Clear all" no longer closes the menu. Focus moves to the search box,
  or to the menu without search, instead of falling out to an enclosing dialog.
- A searchable `Select` keeps the side it opened on while searching. A query that shrank
  the list flipped it to the other side, where it stayed, capped to that side's space.

## 4.3.1 - 2026-09-24

### Fixed

- A searchable `DropdownMenu`, `FilterDropdown` or `RadioDropdown` inside a `Dialog` or
  `Sheet` now focuses its search box when opened. The dialog's focus trap pulled focus
  back out, leaving it on the menu.

## 4.3.0 - 2026-09-24

### Added

- `SelectSearch` and `SelectEmpty`, bringing `DropdownMenu`'s opt-in, in-place search to
  `Select`. `SelectItem` matches on its `textValue`, falling back to its rendered text.
  The search box is shown and focused when the select opens; `alwaysVisible={false}`
  reveals it on the first keystroke instead.
- `dropdown-search`, `dropdown-search-input` and `dropdown-empty` utility classes, alongside
  `dropdown-content` and `dropdown-item`.

### Changed

- A searchable `FilterDropdown` or `RadioDropdown` now shows its search box, focused, as
  soon as the menu opens, instead of waiting for the first keystroke. The search box
  replaces the menu heading and takes `label` as its accessible name.
- In a searchable `FilterDropdown`, "Clear all" moves to a footer pinned to the bottom of
  the menu. Without search, it stays in the "Filters" heading.
- Enter in `DropdownMenuSearch` now activates the first matching item while a query is
  active, and so does a searchable `FilterDropdown` or `RadioDropdown`.
- `DropdownMenuSearch` keeps `role="searchbox"`, its `aria-controls` and its internal
  data attribute, and `DropdownMenuEmpty` keeps its live-region role, even when the same
  props are passed in.

### Fixed

- `FilterDropdown`'s "Clear all" is now a menu item, so keyboard and screen reader users
  can reach it. It was a plain button, which a menu's arrow-key navigation skips.
- Reopening a `DropdownMenu` through a controlled `open` prop, without `onOpenChange`, now
  clears the previous search.
- A ref passed to `DropdownMenuSearch` is no longer detached and reattached on every
  keystroke.

## 4.2.0 - 2026-09-22

Scrollable areas are now browser-native. Equality no longer ships a synthetic scrollbar or a scrollbar-restyling utility.

### Removed

- The `styled-vertical-scrollbar` and `styled-horizontal-scrollbar` utility
  classes, and the `theme-components.css` file.

### Deprecated

- `ScrollArea` and `ScrollBar`. Use a native scrollable element instead — set an overflow and a height on your own container and leave the scrollbar unstyled.

### Changed

- Dialogs and Sheets now scroll with native scrollbars.
