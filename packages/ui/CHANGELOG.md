# Changelog

Notable changes to Equality are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 5.0.2 - 2026-10-28

### Added

- `NavSwitcher` takes `error`, `retrying` and `onRetry`, and `error` needs `onRetry`. With `error`,
  the list shows "Couldn't load {collection}." with a Retry row above any options it already has.
  Picking Retry calls `onRetry` and keeps the list open; with `retrying` the row reads
  "Retrying...". Screen readers hear the failure, the retry and its result, but not a refetch of a
  list that never failed.

### Changed

- A `NavSwitcher` with one option is now a switcher where it was a plain heading, so a user with a
  single project sees the switcher they will get with more. Apps showing one item will see a
  dropdown appear. It is a plain heading only when it has no options, no `action` and no `error`.
- `Spinner` renders spans, not divs, so it can sit inside text such as a select option.

## 5.0.1 - 2026-10-28

### Fixed

- `Skeleton` is a light grey in light mode, where it was near-black. Dark mode is unchanged. This
  includes the loading placeholder in `NavSwitcher`.

## 5.0.0 - 2026-10-27

Removes components that were deprecated or never used. Code that imports any of them needs a
change before upgrading.

### Removed

- `ScrollArea` and `ScrollBar`. Set an overflow and a height on your own element instead; browsers
  draw theme-aware scrollbars of their own.
- `ListOrGridViewToggle`. Use `SegmentedControls` instead.
- `Drawer` and its parts. Use `Sheet` instead.
- `Pagination` no longer scrolls a `ScrollArea` viewport to the top when the page changes. Pass
  `scrollTargetRef` to choose what scrolls into view.
- The `vaul` and `@radix-ui/react-scroll-area` dependencies.

## 4.15.0 - 2026-10-27

Sidebar navigation comes to Equality as two sets of parts: `NavList` rows for going somewhere,
anywhere on screen, and a `Nav` sidebar frame. Menus stay for actions: use `DropdownMenu` for those.
Existing code needs no changes.

### Added

- `NavList`, `NavListGroup`, `NavListItem` and `NavListSeparator`: rows of links or buttons in
  groups. Rows are 36px, and 44px under a coarse pointer such as a touch screen. A row's `suffix`,
  such as a badge or count, is read by screen readers; the › caret comes from `drill`.
- `NavDrill` and `NavDrillLevel`: levels that slide in and out, controlled or uncontrolled. A level
  with a `parent` draws its own ‹ row. They slide only after a drill row or ‹ asked for them, and
  move focus after the changes they asked for.
- `NavRail`, `NavRailItem`, `NavPanel` and `NavSwitcher` (with `loading`): the sidebar frame. Rail
  items and the switcher also grow to 44px under a coarse pointer.
- `blockClosedTypeahead`: stops a typed letter from picking an option while a `Select` is closed,
  for a select that navigates.
- `theme/theme-decisions.css`: the list, control and touch sizes the parts read, such as
  `--eq-list-item-height` and `--eq-touch-target`, which is 44px under a coarse pointer.
- Two colours mixed from `--color-text-primary`, `--color-list-item-current` and
  `--color-list-item-hover`, with the `bg-list-item-current` and `bg-list-item-hover` utilities.
  They switch for dark mode on their own.

### Changed

- `IconButton` forwards its ref to the button or link it renders.

### Fixed

- `IconButton` with `href` passes its other props to the link, so it works as a tooltip trigger and
  keeps `onClick` and `data-*` attributes.

## 4.14.1 - 2026-10-20

### Fixed

- Code block line number gutters now fill full height of container

## 4.14.0 - 2026-10-16

### Added

- The IDE hover on every component lists its props with their types and defaults, and links to the component's documentation page. The list is generated from the types when the package is built, so it always matches the release you have installed.

## 4.13.1 - 2026-10-15

### Fixed

- A long `SelectItem` lines up with the others. Its check column used to shrink when the text was
  too wide, by up to 14px, so an unselected long option sat left of the rest. Long text wraps
  inside the row, and an unbreakable string such as a hash breaks onto more lines instead of
  running past the list's edge. Content that can't shrink, such as an `inline-block` with a fixed
  width, still overflows; give it `block truncate` to cut it to one line instead.

## 4.13.0 - 2026-10-13

`Tabs` can be controlled with a `value` prop, so the indicator from 4.12.0 slides when the active
tab comes from outside, such as the URL. Existing code keeps working, but code that remounts
`Tabs` with `key` to change the tab has to pass `value` instead to get the slide.

### Added

- A `value` prop on `Tabs`, so the active tab can be controlled. Code that remounts `Tabs` with
  `key` to change the tab can pass `value` instead. The indicator then slides to the new tab
  rather than jumping partway through.

### Fixed

- A click on a controlled tab calls `onValueChange` once. Radix requests the tab on both mousedown
  and focus, so a parent that commits the new value later, as React Router does, was called twice.

## 4.12.0 - 2026-10-12

`Tabs` respond to hover, and filled `Tabs` match `SegmentedControls`. Two `SegmentedControls`
fixes come with it. No code needs to change.

### Changed

- Hovering an inactive tab brightens its label. Filled tabs also show a faint fill inset inside
  the track, and transparent tabs a faint underline where the active indicator sits. As on
  `Button`, hover only applies on devices that can hover.
- Filled tabs share the `SegmentedControls` track and indicator: a translucent edge and sunken
  inner shadow on the track, and an active fill inset 2px inside it with 3px corners and the
  raised control shadow.
- The active indicator is a single element that slides beneath the labels instead of over them.
  A one-tab move takes 250ms with the `SegmentedControls` easing, longer moves take a little
  longer, up to 400ms, and reduced motion turns the slide off.
- Tab triggers have a pointer cursor and animate only colour, over 250ms. This includes
  `TabsTrigger` used on its own, which no longer fades into its disabled opacity.

### Fixed

- The keyboard focus ring on filled tabs is drawn inside the tab. Before, the track clipped it to
  a sliver on one edge.
- The keyboard focus ring on the active segment of `SegmentedControls` is visible in light mode.
  The background band meant to separate it from the indicator was the same width as the ring, so
  the ring merged into the indicator's fill.
- Hover on `SegmentedControls` only applies on devices that can hover, as on `Button`, so a tapped
  segment no longer stays highlighted on a touch screen.
- `SegmentedControls` no longer logs a `useLayoutEffect` warning when server-rendered with
  React 18.

### Deprecated

- The `id` prop on `Tabs`. It is optional and ignored, and only existed to pair the old animated
  indicator across renders.

## 4.11.0 - 2026-10-06

A visual refresh of `Button`. No props, variants or sizes change and no code needs to change.
Components built on `Button`, such as `RadioDropdown`, `FilterDropdown`, `SortSelector`,
`DateRangePicker` and `Pagination`, pick up the new look.

### Changed

- Filled variants (`primary`, `danger`, `warning`, `secondary`) have the sharp 1px rim light of
  the active segment in `SegmentedControls`, over a soft top-to-bottom sheen, with a subtle drop
  shadow and no visible border. In light mode the shadow is faintly tinted with the button's own
  colour.
- `tertiary` stays white in light mode and near black in dark, with the same soft sheen and lift
  as the filled variants and a translucent edge in place of its grey border. In dark mode the top
  of that edge is brighter, as a rim light.
- Every variant except `link` and `navigation` has a pressed state. Transitions use the same
  250ms easing as `SegmentedControls`, animate only colour, shadow and underline, and respect
  reduced motion.
- Hover is gentler. In dark mode filled variants lighten slightly instead of darkening into a
  muddy tone, and `primary` and `danger` keep their white text above 4.5:1 while hovered.
- Disabled buttons have no shadow.
- The gap between a button's icon and its label is 6px, as in `SegmentedControls`, up from 4px.
- The active segment in `SegmentedControls` shares the filled button's shadow, so in light mode
  it is faintly tinted with the segment's colour and in dark mode its drop shadow is deeper. The
  track's grey border is the same translucent edge as `tertiary`.
- A selected `DateRangePicker` day matches a filled button, including its pressed state.
- Hovering a danger `Toast` turns its action the `danger` button colour instead of dark red with
  red text, and the action's outline no longer makes it 2px wider than in other toasts.

### Fixed

- Hover colours on `Button`, `DateRangePicker` days and the `Badge` close button only apply on
  devices that can hover, so a tapped control no longer stays highlighted on a touch screen.

## 4.10.2 - 2026-10-06

### Fixed

- `Toast` slides in and out past the same viewport edge, fading as it goes, instead of rising
  from the bottom and leaving to the right. It eases in over 400ms rather than snapping in at
  150ms, and only fades when the user prefers reduced motion. A swiped-away toast fades where
  it was released.

## 4.10.1 - 2026-10-02

### Fixed

- `DateRangePicker` days in a selected range use a lilac tint, the one `IconButton` and the
  `navigation` button use on hover, instead of the primary badge colours. The badge purple is
  a different hue from the lilac of the selected days beside them.
- The active step's marker in a `ProgressIndicator` uses a lilac tint instead of the primary
  badge colours, so it matches the lilac track it sits on and stays as soft as the other markers.

## 4.10.0 - 2026-10-02

### Changed

- `DateRangePicker` day cells are no longer a grid of bordered boxes. Selected days use the
  primary button colours, days in range use the primary badge tint, and hover is the lilac tint
  used by `IconButton`. Selected days in dark mode had white text on light lilac at 2.3:1; they
  now meet WCAG AA, hovered or not.
- A checked radio or checkbox item in a `DropdownMenu`, and so in `RadioDropdown` and
  `FilterDropdown`, uses the primary fill a checked `Checkbox` uses instead of black and white.
- A checked `RadioGroupItem`'s dot is back to 10px. 4.8.0 shrank it to 8px when the radio
  became primary-filled, which made the white dot read as too small.
- Medium and large `IconButton`s have the same 6px corner radius as `Button` (they were 8.5px
  and 9.5px), so icon-only buttons line up with labelled ones in a header.
- `ToastAction` is built on `Button` instead of a copy of its styles, so it always matches
  `Button`.

### Fixed

- A `DateRangePicker` trigger with a range selected no longer picks up every class name from
  the picker's stylesheet, unhashed, as stray classes.

## 4.9.0 - 2026-10-01

### Changed

- `Dialog` and `Command` use the overlay surface, border and shadow tokens that `AlertDialog`,
  `Sheet`, `Drawer` and `Popover` already use. In dark mode a `Dialog` sat darker than the page
  behind it; it now sits above it.

## 4.8.0 - 2026-10-01

### Changed

- `Switch`'s off track is a lighter grey in both themes and clears 3:1 against the page in each,
  as WCAG 1.4.11 asks of a control's state. In dark mode it was 2.07:1. An off `danger` switch is
  grey like any other off switch rather than dark red, so it no longer reads as on. Hover darkens
  the track in light mode and lightens it in dark mode, and the track and thumb move with the
  same 250ms easing as `SegmentedControls` and respect reduced motion.
- A checked `RadioGroupItem` uses the primary fill a checked `Checkbox` uses, instead of a black
  dot.
- `Textarea` has the same 8px padding as `Input`, so their text lines up in a form.

## 4.7.0 - 2026-09-28

### Added

- `SegmentedControls` accepts `aria-label` and `aria-labelledby`, and renders as a `group`, so a
  screen reader announces what the segments choose between. Consumers had to wrap it in their
  own labelled `div` to get this.

## 4.6.0 - 2026-09-25

### Added

- Segmented control options can now display `primary` (default), `neutral`, `success`, `warning`, and `danger` variants that change the selection color based on the state.

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
