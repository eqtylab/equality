# Changelog

Notable changes to Equality are recorded here, following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 7.1.0 - 2026-11-26

### Added

- `text-title-1` for a page title, 28 semibold on a 36 line, and `text-title-2` for the title of a
  dialog, sheet or tab panel, 20 semibold on a 28 line: a step below the page title, on the same
  line as small buttons.
- `cn`, the class helper Equality's components use. It knows the text styles, so a text colour
  beside one doesn't remove it. Import it from `@eqtylab/equality` in place of your own; if you
  keep your own, add `title-1` and `title-2` to tailwind-merge's `font-size` group.
- `TableRowAction` makes the text that names a row, such as a name, into the row's link when the
  row has an `href`, or its button when it has only `onClick`. It covers the whole row, so a click
  anywhere opens it, and screen readers announce it in place, as "Alice Cooper, link", with no
  label of its own. A row with one takes hover and pointer styles without `clickable`, and draws
  no hidden link, so `hrefLabel` isn't used.
- Clickable rows work from the keyboard. Tab reaches each `TableBody`'s rows as one stop, Enter
  opens the row, and Up, Down, Home and End move between rows. The stop is the row's
  `TableRowAction` or link, or, for a `clickable` row with only `onClick`, the row itself, which
  draws the focus ring.

### Changed

- The page title is 28, from 30, on the same 36 line, so it steps down from the content without
  losing its place beside the page's buttons. `text-title` draws it at 28 too.
- `DialogTitle`, `SheetTitle` and `AlertDialogTitle` use `text-title-2`: 20 semibold on a 28 line, from
  18, medium in a dialog or sheet.
- `SheetDescription` and `AlertDialogDescription` sit 4 under their title, as `DialogDescription`
  does. They sat 0 and 8 under it.
- The close button in a `Dialog` or `Sheet` header centres on the title's line. With a description
  under the title it sat level with the middle of both, 10 to 12 below the title.
- `RadialGraph`'s unfilled ticks follow the theme; they were near-black in light mode.
- `cn` uses tailwind-merge 3, so it merges Tailwind 4 classes such as `size-(--eq-size-sm)` and `p-2!`
  correctly.
- A `TableRow` with both `href` and `onClick` runs `onClick` on a plain click instead of following
  the link, so a router can open the row without reloading the page. A click with Cmd, Ctrl, Shift
  or Alt goes to the browser, to open the URL in a new tab or window, and doesn't run `onClick`.
  If your `onClick` already called `preventDefault()` for this, it can stop.
- A `TableRow` with `href` and no `TableRowAction` is one tab stop per `TableBody`, as above,
  where each row's link used to be its own stop.
- `data-state="selected"` highlights any `TableRow` in a `TableBody`, not only a `clickable` one,
  so a row selected with its checkbox shows as selected.

### Deprecated

- `text-title` and `--eq-type-title-font-size`, `-line-height` and `-font-weight`: use
  `text-title-1` and `--eq-type-title-1-*`, with the same values. 8.0 removes them.

### Fixed

- Clicking a checkbox, select, text field, label, switch or menu item inside a clickable
  `TableRow`, including an item in a menu opened from the row, no longer also runs the row's
  `onClick`.

## 7.0.0 - 2026-11-25

### Breaking

- `Avatar` sizes now match the control sizes: `xs` 24, `sm` 28, `md` 36 and `lg` 44. The new
  default, `line`, is as tall as the line of text the avatar sits in: 20 in a table, menu or list
  row. `xl` is now 52, for a profile or page hero. Initials show one letter at `line`, `xs` and
  `sm`, and two at `md`, `lg` and `xl`; screen readers hear them all. A count such as `+3` shows
  whole.

  | You had                    | Use now                                                   |
  | -------------------------- | --------------------------------------------------------- |
  | `sm` (16)                  | no `size`                                                 |
  | `md` or no `size` (24)     | no `size` in rows and lists, `md` elsewhere (grows to 36) |
  | `lg` (36; 32 before 6.1.0) | `md`                                                      |
  | `xl` (44; 40 before 6.1.0) | `lg` to keep 44; `xl` is now 52                           |

  Every renamed size, `xl` included, still compiles but draws at its new size, so check each one
  against the table.

- The `control-row-overhang` utility is gone, so an app that applies it fails to build. Rows now
  hold an avatar or icon button without it: remove it.

- Import Equality's preflight, and any other CSS reset, in a layer before `components`, such as
  `layer(base)`. A reset outside a layer removes table cell padding.

- A block margin on a button in a table cell, such as `my-*`, `mt-*` or `mb-*`, is ignored unless
  written with `!`, such as `my-0!`. Buttons you stack in one cell, or a row of them that wraps,
  close up by 8, or 16 in a comfortable table, so they touch or overlap: give each `my-0!`.

- Table cells pull an element with `data-slot="icon-button"` into their padding, not one with
  `data-icon-button`. An element of your own that set `data-icon-button`, such as a placeholder for
  a row menu, takes `data-slot="icon-button"`, or its row is 44, from 36.

### Added

- `Button`, `IconButton`, `TitleBlock`, `EmptyTableState`, `SegmentedControls`, `Pagination`,
  `CodeBlock`, `MotionCollapsibleContent` and `TruncatedDescription` carry a `data-slot` attribute,
  such as `data-slot="button"`. `TitleBlock` also carries its `data-size`.
- `--eq-table-cell-padding` sets a table cell's padding above and below. Set it on a cell, such as
  `[--eq-table-cell-padding:…]`, not `py-*`, so a button in the cell stays 4 from the row's lines.

### Changed

- Table cells pad 8 above and below, or 12 in a comfortable table. A button in a cell reaches into
  that padding and stops 4 short of the row's lines, and a cell that hides its overflow doesn't
  cut it off. A small button keeps a row 36, from 44, and an `IconButton` at its default size
  keeps rows and headers 36. A default `Button`, an `IconButton` with `size="md"` or a `Select`
  makes a regular row 44, from 52, and a default `Button` or an `md` `IconButton` makes a regular
  header 44, from 36. Comfortable rows and headers stay 44 with a small or default button, and a
  `Select` makes them 44, from 52. A large button makes a row 52, from 60 regular and 44
  comfortable, and a header 52, from 44.
- A `SortButton` in a header isn't pulled, so a wrapped sort label sits as far from the line as
  wrapped text.
- Table rows no longer pad; each cell does. Padding you set on a `TableCell` now replaces
  Equality's, and padding on a `TableRow` adds to it.
- Icons in a `CommandDialog` item draw at 16, as in a `Command`; they were 20. An icon you size
  yourself, such as with `size-4`, keeps its size.
- An `Avatar` no longer shrinks in a flex row.
- A `TitleBlock` takes an `Avatar` as its mark. Give it the Avatar size that matches the block's:
  `sm`, `md` or `lg`.

### Removed

- The `data-avatar` attribute on `Avatar`, and `data-icon-button` on `IconButton`, which is now
  `data-slot="icon-button"`.

## 6.5.0 - 2026-11-25

### Added

- `TitleBlock` sets a title beside a mark, with an optional description under it. Badges and status
  go in `trailing` and buttons and menus in `actions`; both sit at the end of the block on one line,
  badges first, centred on the block, so a badge lines up with the button beside it and a control
  never reaches above the block. It comes in three sizes, by what the block holds: `sm` for a title
  alone, `md` (the default) for a name and a short fact, set as a caption, and `lg` for a title and
  a sentence. The mark sets the block's height, and `md` and `lg` share one title size. A long title
  wraps beside the mark, never under it. When the block is too narrow for its badges and actions
  beside the title, they wrap under the title. A block placed inside another keeps its own size.
- `TitleBlockMark` puts an icon on a square tile, or a circle with `shape="round"`, that takes its
  size from the block.
- `TitleBlockSkeleton` stands in for a title block while it loads, at the same height, so the page
  doesn't jump when the data arrives.
- `Skeleton` carries `data-slot="skeleton"`, so an app can restyle every placeholder, such as its
  loading animation, in one rule.

### Changed

- `CardContentHeader` lays out like `TitleBlock`'s small size: its icon sits in a 28 circle, from
  36, at 16, from 20, beside a 16 semibold title, from 18. The icon and title stay side by side at
  every width; a long title wraps beside the icon. "See All" centres on the header and follows the
  title for screen readers and keyboard. Its "See All" button is named by the heading, such as "See
  All Activity Logs". Its props are unchanged.
- `MetricCard`'s icon is 16, from 20, in the same circle.
- `SectionHeading`'s title is 16 semibold, from 20 medium, and sits tighter over a description.

## 6.4.0 - 2026-11-25

### Added

- `TableContainer` takes `density`. `regular`, the default, keeps rows and the header at 36;
  `comfortable` makes them 44, for tables people read slowly or use mostly by touch. A
  comfortable row stays 44 with a `Button` or `IconButton` of any size, links included.
- `--eq-control-xs-icon-size`, the icon size in an extra-small control, and
  `--eq-table-row-divider-color`, the colour of the line between table rows.
- `Button` carries `data-button` with its size, and `SortButton` carries `data-sort-button`.

### Changed

- Table body rows draw a faint line between them instead of filling every other row. The last row
  draws none.
- The Table header draws its line inside its height, so it is 36, from 37, and grows when its text
  wraps instead of spilling out. A header cell pads by the control it holds: a default-size
  `Button` or `IconButton` keeps the header at 36, and a wrapped `SortButton` label sits as far from
  the line as wrapped text.
- `IconButton` icons match the icon beside text in the control of the same size: 16 at `md`, from
  22, and 20 at `lg`, from 26. `xs` (14) and `sm` (16) are unchanged. The icon button's own size now
  wins over an icon size set through `className`, such as `[&_svg]:size-5`; only an `!important`
  size still wins. For another icon size, pass another `size`.
- `--eq-control-lg-icon-size` is 20, from 16, so an icon in a large `Button`, and any icon your app
  sizes with it, is 20.

## 6.3.0 - 2026-11-25

### Added

- Four text styles for hierarchy: `text-title` for the page title, `text-section` for a card or
  section title, `text-body` for running text and descriptions, and `text-caption` for small
  supporting text. Each is a Tailwind text size on its own line height, so plain `text-sm` matches
  `text-body`. To line a title up with controls, put it in a row with them and centre it. See the
  Typography page.
- Seven size steps, 16 to 52, that Equality's own sizes choose from. Build a custom picture or mark
  on one of them; the Sizing page lists them.
- If your app merges classes with tailwind-merge, register the four styles as font sizes, or a
  text colour beside them removes them. Extend its `font-size` group with `xxs`, `title`,
  `section`, `body` and `caption` through `extendTailwindMerge`; the Typography page has the snippet.
- `--eq-nav-rail-width`, the nav rail's width: 60, or 68 on a touch screen.

### Changed

- `NavRail` is 60 wide, from 52, or 68 on a touch screen. This replaces 6.2.0's advice to make
  the app header as tall as the rail is wide: an app header keeps its height, and a logo column
  above the rail takes `w-(--eq-nav-rail-width)`, so it follows the rail, touch screens included.

### Deprecated

- `--eq-control-sm-font-size`, `--eq-control-md-font-size`, `--eq-control-lg-font-size` and their
  `-line-height` pairs. In a class, use `text-caption`, `text-body` or `text-section`. In CSS, read
  `--eq-type-caption-font-size`, `--eq-type-body-font-size` or `--eq-type-section-font-size`, and
  the matching `--eq-type-*-line-height`. Sizes and line heights are the same. `text-title` and
  `text-section` are also semibold, so a control label that moves to `text-section` turns
  semibold unless it sets its own weight, such as `font-medium`. The control text names still work;
  a later major removes them. Equality's own controls read the text styles, so overriding a style
  changes their text too.

## 6.2.0 - 2026-11-24

### Changed

- Small, default and large controls each name the size of the icon beside their text. Icons stay
  the size they were.
- `NavRail` is 52 wide, from 72: a default control with 8 on each side. Its icons are 16, from 20, the
  same as the icon in any default control. On a touch screen its items grow to the 44 touch target,
  so the rail is 60.
- `NavRail` and `NavPanel` draw their edge line inside their width, so the rail is exactly 52 and
  the panel exactly its width.
- `NavRail` and `NavPanel` start their first item 8 from the top, from 16, so the switcher lines up
  with the rail's first item under a 52 header.
- `NavSwitcher` has no border, so its name sits 8 in from its edge. Open, it draws its outline inside.

To keep an app header lined up with the rail, make it 52 (its 36 controls with 8 above and below,
its bottom line drawn inside) and set `--eq-nav-offset` to `52px`. A header you size by hand at
another height still works; it just no longer meets the rail at a square corner. An app used mostly
on touch screens should make its header 60 there, to match the touch rail.

### Fixed

- A small `Switch` in a table row or a line of text keeps the row at its height. It sat on the text
  baseline, which made the row 3 taller.

## 6.1.0 - 2026-11-20

### Changed

- `Avatar` `lg` grows from 32 to 36 and `xl` from 40 to 44, so `lg` is as tall as a default control
  and `xl` as tall as a large one. `sm` (16) and the default `md` (24) are unchanged. To keep the
  old size, step down a size (`xl` to `lg`, `lg` to `md`) or pass `className="size-8"` or
  `className="size-10"`. An avatar forced to 36 with `!size-9` becomes `size="lg"`.
- A default (`md`) `Avatar` in a `Table` cell or a `DropdownMenu`, `Select` or `Command` item no
  longer makes the row taller: the row stays 36 instead of growing to 40.
- `Avatar` initials are smaller, so two letters no longer reach the edge of the circle.

## 6.0.2 - 2026-11-20

### Changed

- The tick on the chosen item in `DropdownMenu` radio items, `Select` and `NavSwitcher` is now the brand colour.

## 6.0.1 - 2026-11-20

### Fixed

- A clickable `Table` row stays highlighted while the pointer is over a link or button inside it,
  so the highlight no longer flickers as the pointer crosses the row. The link or button shows its
  own hover on top.

## 6.0.0 - 2026-11-20

Controls and rows move to one scale: 28, 36 and 44. The default control drops from 40 to 36, and
menu rows grow from 32 to 36. If your app copied a 40px height from Equality to line something up
with a control, search for it: it now sits 4px taller than the control beside it.

### Changed

| Part                                                                      | Height     | Text     | Side padding |
| ------------------------------------------------------------------------- | ---------- | -------- | ------------ |
| `Button` `md`                                                             | 40 to 36   | 14       | 12           |
| `Button` `lg`                                                             | 44         | 14 to 16 | 32 to 16     |
| `Button` `sm`                                                             | 28         | 12       | 8            |
| `IconButton` `md`                                                         | 40 to 36   |          |              |
| `IconButton` `xs`, `sm`, `lg`                                             | 24, 28, 44 |          |              |
| `SegmentedControls` `md`                                                  | 40 to 36   | 14       | 12           |
| `SegmentedControls` `lg`                                                  | 44         | 14 to 16 | 16           |
| `Input`, `SearchBar`, `Select` trigger                                    | 40 to 36   | 14       | 8, 8, 12     |
| `Tabs` list                                                               | 40 to 36   | 18       | 12           |
| `Table` header                                                            | 40 to 36   | 14       |              |
| `Table` row                                                               | 36         | 14       | 16           |
| `Timeline` `md` marker                                                    | 40 to 36   |          |              |
| `Nav` rail item                                                           | 40 to 36   |          |              |
| `NavSwitcher` and the `Nav` panel title                                   | 32 to 36   | 14       | 8            |
| `NavList` row                                                             | 36         | 14       | 8            |
| `DropdownMenu`, `RadioDropdown`, `SortSelector` and `FilterDropdown` rows | 32 to 36   | 14       | 8            |
| `Select` option                                                           | 32 to 36   | 14       | 8            |
| `Command` row                                                             | 32 to 36   | 14       | 8            |
| `Command` row in a `CommandDialog`                                        | 44 to 36   | 14       | 8            |
| `DisplayField`                                                            | 38 to 36   | 14       | 12           |

- Large `Button` side padding halves, from 32 to 16. This is the largest single move.
- The gap between an icon and its text grows from 6 to 8 on every `md` and `lg` `Button`, link
  buttons included, and on `md` and `lg` segments.
- A row that wraps keeps its padding and grows; 36 is its minimum.
- `FilterDropdown` and `RadioDropdown` show about 9 rows before scrolling, down from 10, and
  `Command`'s list about 8, down from 9.
- `Command`'s input bar stays 36. The field inside it now fits: it was 40, or 48 in a
  `CommandDialog`, and overflowed the bar.
- `Tabs` triggers fill the list's height. `Input` centres its text without vertical padding.
- The `Nav` switcher is as tall as the rail's first item, so the panel header no longer nudges it
  down to line the two up.
- `ControlStatusBadge` shows a pen-on-file icon for In Progress, matching the workbench, and a
  plain tick for Compliant in place of the filled one.

### Added

- Control size decisions: `--eq-control-xs-height`, `-sm-height`, `-md-height` and `-lg-height`;
  a font size, line height and gap for `sm`, `md` and `lg`; and
  `--eq-control-padding-x-condensed`, `-normal` and `-spacious`. A control or row you build
  yourself reads these, such as `h-(--eq-control-md-height)`, so it follows the scale.

### Removed

- `--eq-control-height`. Use `--eq-control-md-height`, which the `Nav` rail now reads.
- `--eq-list-item-height`. Use `--eq-control-md-height`.
- `--eq-list-item-padding-x`. Use `--eq-control-padding-x-condensed`.
- `--eq-list-item-gap`. Use `--eq-control-md-gap`.
- `--eq-list-item-font-size`. Use `--eq-control-md-font-size`.

If your site read or overrode one of these, switch to the name that replaces it.

## 5.6.0 - 2026-11-18

### Added

- `Card` takes `selected`, which makes it a choice in a set, such as a radio card. With `onClick`, a
  choice takes the grey list hover in place of the brand border and gradient; while `selected` is
  `true` it takes the current-item fill, a primary border and, in forced colours, an outline. Pass
  `false` for the unchosen cards so they hover the same way.
- `Card` takes `variant`, `success`, `warning` or `danger`, which tints its border and background
  with that badge colour. It defaults to `default`, untinted, and isn't combined with `selected`.
  Both tints sit over the elevation's background rather than replacing it.
- `Textarea` takes `variant="bare"`, for a textarea inside a frame that draws its own edge, such as
  an editor with a toolbar: no border, background, radius or focus ring, so the frame must show
  focus. `variant` defaults to `default`.
- `Button` takes `variant="field"`, for a button that opens a picker in a form. It draws as
  `Select`'s trigger does, with the input's border, background and hover, full width, spreading its
  content across it and clipping what overflows. Wrap the label in a `flex-1 truncate` span, so a
  long value cuts off rather than pushing a `suffix` out.
- `IconButton` takes `size="xs"`: 24px, the WCAG 2.2 AA minimum target size, with a 14px icon, for
  an action inside a picker field such as a clear button.

## 5.5.3 - 2026-11-18

### Changed

- `SheetHeader`'s background is a soft light from beyond its top-left corner, in place of the
  brand purple fade across it. It takes the link purple at 8% in light mode and the brand purple at
  13% in dark mode.

## 5.5.2 - 2026-11-18

### Fixed

- An inline `SelectTrigger`'s chevron no longer shrinks below the default trigger's 16px beside
  small text. It still grows with larger text, at 0.75em.

## 5.5.1 - 2026-11-18

### Added

- `SelectTrigger` takes `variant="inline"`, for a select set into a heading or a line of text,
  such as a title that switches between items or a version picker beside its label. It flows
  with the text around it, has no border, background, padding or fixed height, takes the
  surrounding font size and line height, and shows its chevron at full opacity, sized to the
  font. Name it with its current value, such as `` `${policy}, switch policy` ``. `variant`
  defaults to `default`, the boxed trigger.
- `SelectContent` takes `matchTriggerWidth`, which makes the list exactly as wide as its trigger,
  wrapping longer options, rather than at least as wide. It applies to the default `popper`
  position and defaults to `false`.

## 5.5.0 - 2026-11-17

### Added

- `Timeline`, a record of what happened to one thing, in order: entries down a rail, in sections
  marked by the state they happened under. It is three parts: `Timeline`, `TimelineSection` and
  `TimelineItem`. A section draws a marker for its state, joined to the next by a connector, and
  the marker stays pinned beside its entries as they scroll. A section takes an `icon`, a Lucide
  element such as `<Clock />`, an optional `label` that says its state to a screen reader, and one
  of the five status variants, defaulting to `neutral`. `success`, `warning` and `danger` sections
  default to `Badge`'s icons for those variants; `neutral` and `primary` sections need an `icon`. `size` is `sm` (a 20px marker, an
  icon-only `Badge`) or `md` (40px, an `md` `Button`'s height, the default).
- `--eq-timeline-offset`, a length, pins a `Timeline`'s markers that far below the top of the
  scrolling area, such as under a sticky header. It defaults to `0px`.
- `--eq-timeline-marker-background` and `--eq-timeline-marker-color` colour a `TimelineSection`'s
  marker and connector for a state no variant covers, such as a control status.

## 5.4.5 - 2026-11-17

### Changed

- On a touch screen, a searchable `Select`, `DropdownMenu`, `FilterDropdown` or `RadioDropdown`
  leaves its search unfocused when it opens, and `FilterDropdown`'s "Clear all" returns focus to
  the menu, so the phone's keyboard doesn't cover the list. A tap on the search box, or a typed
  key, focuses it.

### Fixed

- A table row with an `sm` `IconButton`, the default size, such as an actions menu or a
  `CopyButton`, is as tall as a row of text. The button overhangs the row's padding instead of
  setting the row's height.
- `SortButton` draws Equality's focus ring. Chromium drew its own rounded ring, and Firefox a
  square one.
- `Input`, `SearchBar`, `CommandInput`, `SelectSearch` and `DropdownMenuSearch` set 16px text
  below `md`, as `Textarea` does. Under 16px, iOS Safari zooms into a focused field and stays zoomed.
- The same fields end a placeholder, or an unfocused value, that doesn't fit in "…". It was cut off
  mid-word.

## 5.4.4 - 2026-11-16

### Fixed

- `NavPanel`'s `header` keeps its height when the list is longer than the panel. Previously it shrunk,
  squashing whatever it contained. It also stays pinned at the top as the rows scroll under it.

## 5.4.3 - 2026-11-16

### Changed

- Improve nav list group label contrast

## 5.4.2 - 2026-11-10

### Changed

- `Pagination` fills its container's width, as it measures its own width to choose a layout. In a
  parent that sizes to its content, such as `w-fit`, `inline-flex` or a right-aligned flex row, give
  it a width; side margins on it now overflow its parent.
- `Pagination`'s info reads "51–75 of 146 agents", then the items-per-page dropdown labelled "per
  page". It read "Showing 51 to [25] of 146 agents", with the page size where the range's end
  belongs, so past page 1 it read as "51 to 25". Screen readers hear "51 to 75 of 146 agents".

### Fixed

- `Pagination` fits a phone, where its row ran off the screen. Below 42rem it keeps one line: the
  count without its noun, the items-per-page dropdown, labelled "per page" where it fits, and
  previous, current page and next. When even that doesn't fit, the page buttons wrap below the
  count and stay on the right.
- `Pagination` shows a `currentPage` outside 1 to the last page, such as after a filter shrinks
  the list, as the nearest page. It had shown no current page and a count such as "95–95 of 95".
  Clamp your own page state too, or the list shows an empty page.

## 5.4.1 - 2026-11-09

### Added

- `DateRangePicker` takes `timeZone`, an IANA name. Its today, selected days, label and the
  `from` and `to` it hands back follow that zone, so a range picked under a user's zone
  preference starts and ends at that zone's midnights. Without it, days follow the browser's zone
  as before.
- `DateRangePicker` marks today with `aria-current="date"`.

### Fixed

- `DateRangePicker` treats an invalid `from` or `to` as unset. It had labelled the range
  "Invalid Date".

## 5.4.0 - 2026-11-09

### Added

- `--eq-nav-offset`, a length, pins `NavRail` and `NavPanel` that far below the top of the viewport,
  such as under a sticky header. It defaults to `0px`. Set it on the element around the sidebar.

### Changed

- `DropdownMenu`, `Select` and `Command` items light grey on hover and keyboard focus, like a Nav
  row, where they turned purple with purple text, and they no longer lift with a shadow. Danger and
  warning items keep their own colours.
- A `CommandItem` lights when it is selected, from the keyboard or the pointer, where it lit only
  under the pointer, so arrowing through a list showed nothing.
- A linked `Table` row draws keyboard focus in the focus-ring colour, like every other control,
  where it used the paler brand purple.

### Fixed

- A `NavSwitcher` in a `NavPanel` beside a `NavRail` centres on the rail's first item, where it sat
  4px high with a mouse or trackpad.
- A focused linked `Table` row draws one focus line, where the row's link drew the browser's own
  outline just outside it as well.

## 5.3.4 - 2026-11-06

### Fixed

- `Nav` rows and rail items keep their height, padding and text size in a site built against the
  published package, where they shrank to bare text. Only production builds of sites using
  `@eqtylab/equality/theme-config.css` were affected; dev servers looked right.

## 5.3.3 - 2026-11-05

### Changed

- A clickable `Table` row lights grey on hover and when selected, like a Nav row, where it turned
  purple.

### Fixed

- Every other `Table` row is a faint grey step from its neighbours, where Chrome tinted it brown,
  most visibly in dark mode. In light mode the step is easier to see than before, where it had
  almost disappeared, and in dark mode it is a little stronger.

## 5.3.2 - 2026-11-03

### Fixed

- A long label inside a `NavListExpandable` group ends in "…" at the panel's edge, where it was cut
  off and pushed the group's tree line past the panel.

## 5.3.1 - 2026-11-02

### Fixed

- A `DropdownMenuRadioItem` marks the chosen option with a tick level with its first line, where
  every row drew a radio ring. This changes `RadioDropdown`, `SortSelector` and the docs site's
  version and site menus.
- A `DropdownMenuCheckboxItem`'s box sits level with the first line of a two-line item, where it
  was centred on the whole item.

## 5.3.0 - 2026-11-02

### Added

- `NavListExpandable`, `NavListExpandableTrigger` and `NavListExpandableContent`: a nav group the
  user opens and closes with its header row. A closed group keeps its links in the page, hidden,
  so they are in server-rendered HTML. Its arrow points down when closed and up when open, and a
  closed group holding the current page lights its header row. A top-level group's header leads
  in primary text, and a link beside it takes the same colour; its rows indent their text. A
  group inside a group reads as a row, and its rows are inset behind a tree line, highlight
  included. The header takes `prefix` and `suffix` like a row, so a status badge sits after its
  label and screen readers read it out. A folder opens itself, and every folder around
  it, when the current page moves inside, such as after a link that changes the page without a
  reload. A reader can still close it; it opens again at their next page inside it. Inside
  `NavDrill`, give a group a `value`, unique within its level, so it stays as the reader left it
  after they drill away and come back. With JavaScript off, every group shows open without its
  arrow, and its header leaves `aria-expanded` out until it loads, so it never reads as collapsed
  over visible links. Browsers from before 2023 keep closed groups closed.
- `--eq-nav-motion-duration`, `--eq-nav-motion-ease` and `--eq-nav-motion-nudge`: the nav's motion,
  named once. `NavDrill` reads them, and a folder group opens with the same motion: its rows nudge
  12px down as they fade in, and on the way out are gone within the first third.
- `--eq-switcher-name-fade`: the fade on `NavSwitcher`'s name, from primary to secondary text, as
  before. It is now a variable, so a site can set its own.
- `--eq-list-item-muted-color`: the colour of a row's quiet marks, tertiary text. The drill ›, a
  group's arrow, the back row's ‹, `NavSwitcher`'s ↕ and the new-tab ↗ all read it, so a site
  sets them in one place.
- `NavListItem` marks a link with `target="_blank"`, set on it or on its `asChild` link: a muted ↗
  after the label, "(opens in a new tab)" for screen readers, and `rel="noopener noreferrer"`
  unless you pass your own. Remove any ↗ or "(opens in a new tab)" you put in `suffix`.

### Changed

- Nav spacing comes from one gap. Items in `NavPanel`, `NavList` and a `NavDrill` level sit
  `--eq-list-gap` (2px) apart, and a group label carries the group gap above it as its own top
  padding, so it sits 12px below whatever comes before it. A string `header` in `NavPanel` is now
  32px tall, like the switcher, so its text and the rows below sit 6px lower. Anything else an app
  puts straight into the panel or list, such as a search field, gets the 2px gap.
- Nav chevrons, the drill › and a group's arrow, are muted, as quiet as a switcher's. Every muted
  mark takes its row's colour on hover and on the current row, the back row's ‹ and the
  switcher's ↕ included. Studio's › gets quieter.
- A nav row's hover fill shows only with a mouse or trackpad, so a row tapped on a touch screen
  no longer stays lit.
- `Badge` and `Icon` render spans, not divs, so they are valid inside a button, such as a folder
  header's `prefix` or `suffix`. They look the same. A ref or props typed `HTMLDivElement` on
  either now needs `HTMLSpanElement`.

### Fixed

- `MotionCollapsibleContent` no longer grows from nothing when it first renders open, such as an
  `Input` that loads with an error.
- `MotionCollapsibleContent` clips its content while it opens again after a close. It mounted
  unclipped for a frame and could paint over what follows.
- Rows under a `NavSwitcher` in `NavPanel`'s header sit 2px below it, as rows sit below each other.
  Without a group label, they touched it.
- In forced colours, only the current nav row and rail item keep a border. Every row was boxed, and
  the current rail item had no mark at all.

## 5.2.0 - 2026-11-02

### Added

- `Button` takes `variant="success"`, a filled green button for actions that approve or confirm, such as approving a review.

## 5.1.1 - 2026-11-02

### Fixed

- A `Banner` message breaks a long unbroken token, such as a URL in an error, where it ran out of
  the strip.
- A `NavSwitcher` with `error` and options already loaded reads "Some {collection} couldn't be
  loaded." where it read "Couldn't load {collection}." above the options it had.

## 5.1.0 - 2026-11-02

### Added

- `Banner`, a full-width strip stating the status of the page it tops (archived, revoked, waiting
  on someone), with an icon chip, a one-sentence message and an optional `action`, which drops to
  its own line on a narrow screen. It has the same five variants as `Alert`, defaulting to
  `neutral`, but no default icons: `icon` is required, since it names the state. `border="top"`
  moves its rule above it, for a banner at the foot of a page header, and `as="aside"` makes it a
  landmark. It has no live region.
- `Alert` takes `action`, a control at the end of the title row such as a Retry button. The
  description or body stays under the title, and screen readers reach the action after them. Apps
  that placed a control there by overriding the grid can drop the override.

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
