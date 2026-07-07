# Future Improvements

A running list of component improvements surfaced while writing documentation. These are **not** doc issues — the docs describe the components as they behave today. Each item is a candidate enhancement to the `ui` package (or its demos), grouped by theme and roughly ordered by impact.

> Context: compiled from a documentation pass across the component library. Paths point at the relevant source so each can be picked up independently.

## Accessibility

Most components are built on Radix and inherit good accessibility. The items below are where the design system's own additions (or omissions) create gaps.

- **Spinner** — renders bare `<div>`s with no `role="status"` or `aria-label`, so loading is conveyed only visually and is invisible to screen readers. Add `role="status"` + an accessible label (e.g. "Loading").
  `packages/ui/src/components/spinner/spinner.tsx`
- **Loading Overlay** — no `role="status"`/`aria-live`, no focus trap, and no `aria-busy` on the blocked content. Screen reader users may not be told loading started, and keyboard focus can still reach content behind the overlay. Add a live region and focus management.
  `packages/ui/src/components/loading-overlay/loading-overlay.tsx`
- **Command** — keyboard navigation works, but there is no visual highlight for the active item. cmdk marks it with `data-selected="true"`, but `.command-item` only styles `:hover`/`:focus`. Add a `data-[selected=true]` rule mirroring the hover colors:
  ```css
  @apply data-[selected=true]:text-lilac-700! data-[selected=true]:bg-lilac-300/50!;
  @apply dark:data-[selected=true]:bg-lilac-600/50! dark:data-[selected=true]:text-lilac-100!;
  ```
  `packages/ui/src/components/command/command.module.css`
- **Pagination** — numbered page buttons convey the current page only via color (`primary` vs `tertiary`), with no `aria-current="page"`; the control group isn't wrapped in a `<nav aria-label="Pagination">` landmark.
  `packages/ui/src/components/pagination/pagination.tsx`
- **Icon Button** — `label` (which becomes `aria-label`) is optional, but an icon-only button with no label is unlabeled for screen readers. Consider making `label` required.
  `packages/ui/src/components/icon-button/icon-button.tsx`
- **Copy Button** — on success the label swaps to "Copied!" but there's no `aria-live` region, so the confirmation isn't announced. Add a visually-hidden live region.
  `packages/ui/src/components/copy-button/copy-button.tsx`
- **Form / FormMessage** — the validation message isn't a live region (`aria-live`/`role="alert"`), so an error appearing while focus stays in the field isn't announced.
  `packages/ui/src/components/form/form.tsx`
- **Radial Graph** — purely visual; the percentage is only in the label text and bar fills, with no `role="progressbar"`/`aria-valuenow`. If the value is meaningful data (e.g. compliance scores), expose ARIA progressbar semantics.
  `packages/ui/src/components/radial-graph/radial-graph.tsx`
- **Date Range Picker** — calendar day buttons render only the day number (no `aria-label` for the full date), selected/today cells have no `aria-selected`/`aria-current`, and the grid has no arrow-key navigation (relies on tab/click).
  `packages/ui/src/components/date-range-picker/date-range-picker.tsx`
- **Info Card** — `label` and `description` have no programmatic association. If read as standalone data points, a `<dl>`/`<dt>`/`<dd>` structure would convey the label→value relationship.
  `packages/ui/src/components/info-card/info-card.tsx`
- **Skeleton** — no built-in loading semantics. Document/encourage the consumer pattern of `aria-busy` on the loading container with the skeletons `aria-hidden`, or provide a labelled wrapper.
  `packages/ui/src/components/skeleton/skeleton.tsx`
- **Motion Collapsible Content** — no `prefers-reduced-motion` handling; it always animates. Honor the media query for motion-sensitive users. (Trigger↔region `aria-expanded`/`aria-controls` wiring is left to consumers — worth documenting.)
  `packages/ui/src/components/motion-collapsible/motion-collapsible.tsx`

## Correctness / Bugs

- **Truncated Description** — truncation decides _whether_ to clip using plain-text length but slices the _raw HTML_ string (`description.slice(0, maxLength)`). With any markup this can cut mid-tag or leave unclosed tags, which is then fed to `dangerouslySetInnerHTML` — producing malformed output and inconsistent visible length.
  `packages/ui/src/components/truncated-description/truncated-description.tsx`
- **Search Bar** — the clear button uses `name="XIcon"`. Lucide's canonical icon is `X` (`XIcon` is an alias that exists only in newer versions). If the installed lucide version lacks the alias, `IconButton` warns and renders `null`, so the clear button silently disappears. Prefer `name="X"`.
  `packages/ui/src/components/search-bar/search-bar.tsx`
- **Checkbox** — stray trailing space / `{' '}` inside the indicator markup. Harmless, minor cleanup.
  `packages/ui/src/components/checkbox/checkbox.tsx`

## Security

- **Truncated Description** — renders `description` via `dangerouslySetInnerHTML` with no sanitization. If any description can originate from user input, this is an XSS vector. Sanitize (e.g. DOMPurify) or document a hard "trusted content only" contract.
  `packages/ui/src/components/truncated-description/truncated-description.tsx`

## API Consistency

- **Icon** — an unknown Lucide string name **throws** (`Icon "<name>" not found`), crashing the render, whereas **Icon Button** with an unknown name only warns and returns `null`. Align the two: either both throw or both degrade gracefully.
  `packages/ui/src/components/icon/icon.tsx` · `packages/ui/src/components/icon-button/icon-button.tsx`
- **Tooltip vs Popover — arrow** — Tooltip always renders an arrow (hardcoded), while Popover makes it an opt-in `arrow` prop. Consider making them consistent.
  `packages/ui/src/components/tooltip/tooltip.tsx` · `packages/ui/src/components/popover/popover.tsx`
- **Tooltip — provider footgun** — a `Tooltip` without a `TooltipProvider` ancestor silently doesn't work. Consider a pre-composed export or a default provider to make it foolproof.
  `packages/ui/src/components/tooltip/tooltip.tsx`
- **Switch — thumb icon** — only a single `thumbIcon` is supported; showing a different icon per state requires the consumer to swap it based on `checked`. A `thumbIconChecked` prop (as the demo simulates) could be a first-class feature.
  `packages/ui/src/components/switch/switch.tsx`
- **Section Heading** — `renderRightContent` is a render prop (`() => ReactNode`) though the content isn't parameterized; most sibling components (Card Content Header, Display Field `actions`) take a `ReactNode` directly. Consider accepting a plain node for consistency.
  `packages/ui/src/components/section-heading/section-heading.tsx`
- **Card Content Header** — the "See All" button label is hardcoded and not configurable; there's also a `TODO` to make the icon a slot so elevation can be set independently.
  `packages/ui/src/components/card-content-header/card-content-header.tsx`
- **Scroll Area** — hardcodes a single vertical `ScrollBar`, so horizontal scrolling isn't supported through the `ScrollArea` API (the `ScrollBar` export exists for manual composition). Consider accepting an `orientation`.
  `packages/ui/src/components/scroll-area/scroll-area.tsx`
- **Bg Gradient** — an unrecognized `theme` falls back to black (invisible-ish), which is easy to miss. Consider failing loudly or falling back to `primary`. (Currently guarded by the `Theme` type, so only reachable via unsafe casts.)
  `packages/ui/src/components/bg-gradient/bg-gradient.tsx`
- **Page Not Found** — the component is exported as `NotFound` but the doc/page is titled "Page Not Found". Not a bug, just a naming mismatch to be aware of.
  `packages/ui/src/components/page-not-found/page-not-found.tsx`

## Notes

- Items were identified during documentation and have **not** been verified with tests. Confirm each before acting.
- The list is a prompt for review, not a defect log.
