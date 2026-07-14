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
