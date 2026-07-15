# Docs Improvements

Documentation updates to apply after the accessibility work lands and feat/docs has been merged. These describe new/changed component behaviour that the MDX docs don't yet cover. Grouped by component.

## Spinner

`packages/demo/src/content/components/spinner.mdx`

- **New `label` prop.** The Spinner now renders with `role="status"` and a
  visually-hidden label so screen readers announce loading. The label defaults to
  `"Loading"` and can be customised to describe the specific operation.

  Suggested additions:
  1. An **Accessibility** section (before Props):

     > The Spinner renders with `role="status"` and a visually-hidden label so screen
     > readers announce that content is loading. The label defaults to `"Loading"` and
     > can be customised via the `label` prop to describe the specific operation
     > (e.g. `"Saving changes"`).
     >
     > ```tsx
     > <Spinner label="Saving changes" />
     > ```

  2. A new row in the **Props** table:

     | Name    | Description                                  | Type     | Default   | Required |
     | ------- | -------------------------------------------- | -------- | --------- | -------- |
     | `label` | Accessible label announced by screen readers | `string` | `Loading` | ❌       |

## Loading Overlay

`packages/demo/src/content/components/loading-overlay.mdx`

- **Now a modal built on Radix Dialog.** Previously a plain overlay `<div>`, the
  Loading Overlay is now backed by a modal Radix Dialog. When `isVisible` is true it:
  - traps keyboard focus inside the overlay and makes background content inert to
    keyboard and screen reader users,
  - locks background scroll,
  - announces the `message` to screen readers when it appears, and
  - restores focus to the previously focused element when it hides.

  It is intentionally **non-dismissable** — Escape and outside clicks do nothing;
  visibility is controlled solely by the `isVisible` prop.

  Suggested additions:
  1. An **Accessibility** section describing the modal/focus-trap behaviour and that
     `message` doubles as the announced accessible name.
  2. Confirm the existing **Props** table lists `isVisible` (`boolean`, required) and
     `message` (`string`, default `Loading...`). No prop API changed — only behaviour.

## Pagination

`packages/demo/src/content/components/pagination.mdx`

- **Current page is now exposed to assistive tech.** The active page button previously
  differed only by colour (`primary` vs `tertiary`), which conveyed the current page by
  colour alone. It now also carries `aria-current="page"`.
- **Page buttons are explicitly labelled.** Each numbered button has `aria-label="Page N"`,
  so it announces as "Page 3, button". The active page
  announces as "Page 3, current page, button" (the "current page" comes from
  `aria-current`, so the label doesn't repeat it).
- **The page controls are now a landmark.** Prev / page numbers / next are wrapped in
  `<nav aria-label="Pagination">`, so screen reader users can jump straight to it. The
  "Showing X to Y of Z" info and the items-per-page `Select` sit _outside_ the landmark
  — they're status/settings, not navigation.

  Suggested addition: a short **Accessibility** section noting both of the above. No
  prop API changed — semantics only.

## Copy Button

`packages/demo/src/content/components/copy-button.mdx`

- **"Copied!" is now announced.** A visually-hidden `role="status"` live region is
  always mounted and its text flips to "Copied!" on success, so screen readers announce
  the confirmation.
- **"Copied!" tooltip on copy.** A tooltip now appears on successful copy. It is
  _controlled_ (tied to the copied state), so it is a confirmation — it does **not**
  appear on hover. It carries its own `TooltipProvider`, so consumers don't need to
  supply one.
- **Behaviour change — the accessible name is now stable.** The button previously
  swapped its `aria-label` to "Copied!" on success; it now always uses `label`
  (default `Copy to clipboard`). A button's name should describe its action, not a
  state, and the live region already conveys the state. The icon still swaps
  `Copy` → `Check` for the visual cue.

  Suggested addition: an **Accessibility** section covering the above. No prop API
  changed.

## Form / FormMessage

`packages/demo/src/content/components/form.mdx`

- **Validation errors are now announced.** `FormMessage` carries `role="alert"` when it
  is rendering a validation error, so an error appearing while focus stays in the field
  is announced to screen readers. Previously it was a plain `<p>`, so the message was
  only reachable by browsing to it.

  Suggested addition: a short **Accessibility** section noting that errors announce
  automatically. No prop API changed — semantics only.

## Radial Graph

`packages/demo/src/content/components/radial-graph.mdx`

- **Now exposes ARIA progressbar semantics.** The root carries `role="progressbar"`
  with `aria-valuenow` / `aria-valuemin={0}` / `aria-valuemax={100}`, so the value is
  real data to assistive tech. `aria-valuenow` is clamped to 0–100
  (the bars still use the raw `percentage`). The bars and the visible
  label are `aria-hidden` — they're surfaced through the ARIA name/value instead, so
  nothing is read twice.
- **It is now focusable.** The root is `tabIndex={0}` with the standard focus ring, so
  keyboard and screen reader users can Tab straight to the value.
- **`aria-label` is now accepted, and recommended.** `RadialGraphProps` extends
  `HTMLAttributes<HTMLDivElement>`, so `aria-label` (and any other div prop) passes
  through — previously it couldn't.

  Suggested additions:
  1. An **Accessibility** section recommending `aria-label` for a meaningful name:

     > ```tsx
     > <RadialGraph percentage={75} subLabel="Compliant" aria-label="Compliance score" />
     > ```

  2. The **Props** table should note `aria-label` is recommended, and that the component
     accepts standard `div` attributes.
