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
