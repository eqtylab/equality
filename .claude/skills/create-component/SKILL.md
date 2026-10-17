---
name: create-component
description: Add a new component to the design system
metadata:
  # Maintainer-only: hidden from `npx skills add eqtylab/equality`, which
  # should offer consumers the equality-design-system skill, not this one.
  internal: true
---

# Create Component

When creating Equality components,

## Common Patterns

### States

We commonly use the following states for components:

- Neutral (Default)
- Primary (A hierarchical increase, uses the primary brand color)
- Success (Something has worked correctly)
- Warning (The user should be informed that something may not be working as intended or requires attention)
- Danger (Destructive actions or serious errors)

### Prefix and Suffix Slots

Components like "Button" and "Input" have `prefix` and `suffix` slots to place icons or buttons before, or after the primary component content.

### Documenting Props

Give every prop a one-line doc comment where it is declared: on the props interface, or on its entry in the `cva` `variants` object. Editors show it when hovering the prop, and `build:lib` copies it into the props list shown when hovering the component (`src/scripts/document-props.js`).

Leave the default out of the comment. The build reads it from the destructured default or from `defaultVariants`, so a default written into the comment goes stale when the code changes. Add `@default` only when neither shows the real default.

## Documentation

After creating the component in the "ui" package, always create a corresponding docs MDX under `packages/demo/src/content/docs/components`.

Review the `create-documentation` skill for instructions on how to format the docs.
