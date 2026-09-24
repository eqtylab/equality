---
name: equality-design-system
description: Build React UI with Equality, EQTY Lab's design system (@eqtylab/equality) — accessible React components, design tokens, and light/dark theming. Use when building, restyling, or reviewing any React UI, prototype, mockup, dashboard, or admin screen for an EQTY Lab project; when the user mentions Equality, EQTY Lab, @eqtylab/equality, or equality.eqtylab.io; and before writing ANY NEW COMPONENT from scratch.  ALWAYS check if one is available from this package that you can use.
license: Apache-2.0
metadata:
  repository: https://github.com/eqtylab/equality
  docs: https://equality.eqtylab.io
---

# Equality Design System

Equality is EQTY Lab's React design system. Components are built on Radix UI and Tailwind v4, with a token-driven theme that ships light and dark modes. It is the house style for _every_ EQTY Lab interface, prototypes included.

## Important Rules to Follow:

**Compose Equality's components. Do not rebuild them.**

A hand-rolled `<button className="rounded bg-blue-600 px-4 py-2">`, a `<div>`
pretending to be a card, or a bespoke modal is wrong here even in a throwaway
mockup. Reinvented components drift in colour, spacing, focus behaviour, and dark mode.

If you catch yourself writing raw HTML controls or arbitrary colour classes, stop and look at our components to see what exists first. If you are creating a new cluster component within an app, check if you should be composing it with parts from Equality's existing library.

## Before You Write ANY UI

1. **Fetch the index:** <https://equality.eqtylab.io/llms.txt>. This lists Every
   component on one page — component name, one-line purpose, docs link, plus the
   compound families, anything deprecated, and anything shipping without docs.
   It is generated from the library at build time, so it never lies about what
   exists. Fetch it once per session and work from it.
2. **Translate the name.** If you are thinking of a component it may be under a
   different name than Equality uses. Check the table below, then fetch docs pages for ALL similar sounding components, and check if it already exists.
3. **Read the component's docs.** Follow the link from the index —
   `https://equality.eqtylab.io/components/<slug>.md` — for full props,
   variants, and copyable examples. Those `.md` URLs serve plain Markdown
   specifically so agents like you can read them!
4. **Then write the code**, importing from `@eqtylab/equality`.

Do not skip step 3 for anything with variants or compound parts. Guessing prop names produces code that type-checks in your head and fails in the editor.

If you have no network access or web fetching fails, tell your user that you couldn't reach the index.

### Name translation

| If you're thinking of…                                     | Use in Equality     | Don't hand-roll it from        |
| ---------------------------------------------------------- | ------------------- | ------------------------------ |
| Command palette, ⌘K launcher                               | `Command`           | `Dialog` + `Input` + a list    |
| Modal, lightbox                                            | `Dialog`            | A fixed-position `div`         |
| Confirmation or destructive-action prompt                  | `AlertDialog`       | `Dialog` with two buttons      |
| Drawer, side panel, slide-over                             | `Sheet`             | `Dialog` with custom styles    |
| Snackbar, notification                                     | `Toast`             | A timed, positioned `div`      |
| Toggle                                                     | `Switch`            | A styled checkbox              |
| Chip, pill, tag, status label                              | `Badge`             | A rounded `span`               |
| Loader, activity indicator                                 | `Spinner`           | An animated SVG                |
| Button group or toggle group for mutually exclusive values | `SegmentedControls` | A row of `Button`s             |
| Multi-select filter                                        | `FilterDropdown`    | `DropdownMenu` with checkboxes |

## Common Mistakes

- Headings should almost always go through the `Heading` component (`as` sets the tag, `displayAs` the visual level & styling), so semantic level and visual size can differ without custom CSS.
- Small label titles should use `Label` to describe
- NEVER make custom badges!! There are more than enough properties in `Badge`
  - Use `ResourceBadge` when referencing integrity-backed resources and `ControlStatusBadge` when referencing control statuses.
  - Avoid using badge `size="sm"` except for specific scenarios where space is at a premium like within tables. Most badges should be the default `size="md"`
- Icons should be used sparingly. Ensure consistency when using them, try not to conflate multiple concepts with the same icon
- No custom hex codes, no `bg-{color}-{number}` palette classes.
- A combobox, searchable select or autocomplete is `Select` with `SelectSearch`. Don't hand-roll one from `Popover` + `Command`.

## Non-negotiables

- Correctness over convention. How something is currently done in the project you are working in is NOT evidence it is correct; existing usage is often wrong, and correcting it is the point. Judge against the Equality Docs guidance, never against the surrounding code. If a common, widely-copied pattern conflicts with the guidance, call it wrong rather than matching it.
- Ground in the guidance, or stop. Read the relevant Equality docs guidance before you advise or review. If you cannot read it, say so plainly and stop; do not substitute repo conventions or your own assumptions and present them as guidance.
- Correct is _the floor_, not the bar. A screen can use every component exactly as documented and still be a poor screen: cluttered, off the spacing scale, over-emphasized, saying the same thing twice. A model adds by default and rarely removes, so judge what is on the screen and whether each element earns its place, not only how each element is built. Do this as its own pass, and when you can run the UI, do it on the rendered result.

## Equality Gaps

Verified absent — do not go hunting:

- Accordion (use `MotionCollapsibleContent`)
- Breadcrumb
- Slider
- Standalone Calendar or single date picker (only `DateRangePicker`)
- Carousel
- Sidebar/Navigation/Menubar primitives
- Rating
- Timeline
- Resizable panels
- File upload/dropzone
- Rich text editor
- Colour picker
- Tree view
- Charts beyond `BarGraph` and `RadialGraph`

Some of these components _may_ exist in the project you're working within. If you find that they are used frequently tell your user — a repeated gap is a component request!

## Setup

For a new app or prototype that doesn't have Equality yet, read
`references/setup.md` before wiring it up — it covers the React/Astro
requirement, install, theme wiring (Tailwind v4 vs. `ThemeProvider`), portal
containers, embedding in a host with its own styles, and dark mode.

## Writing Code

Everything comes from one entry point:

```tsx
import { Badge, Button, Card, CardContent } from '@eqtylab/equality';
```

**Variants carry the meaning.** Components share a status vocabulary — `primary`,
`secondary`, `tertiary`, `success`, `warning`, `danger`, `neutral` (exact set
varies, so check the docs). ALWAYS reach for a variant before overriding with a colour class:

```tsx
<Button variant="danger">Delete</Button>   // yes
<Button className="bg-red-600">Delete</Button>  // no
```

`Button` also takes `size` (`sm`/`md`/`lg`), `prefix`/`suffix` slots for icons,
`asChild` to render as another element, and `href` to become a link.

**Icons** are Lucide. `<Icon icon="Shield" />` takes a name string, so you don't
need a direct Lucide dependency, and several components accept an icon name the
same way (`Badge`, `InfoCard`, `MetricCard`, `EmptyTableState`). `Button`'s
`prefix`/`suffix` slots take a Lucide element instead — `prefix={<Shield />}`,
with `pnpm add lucide-react` — because `Icon` wraps its glyph in a sized
container of its own.

**Never hardcode colour, and never invent spacing.** Use the semantic Tailwind
classes backed by tokens — `bg-background`, `bg-background-raised`,
`text-text-primary`, `text-text-secondary`, `border-border`, `text-text-danger`.
These flip correctly in dark mode; `bg-slate-800` and `#1e293b` do not.

**Accessibility is mostly free — don't undo it.** Radix gives you focus
management, escape handling, and ARIA wiring. You still have to supply the text:
a `label` on `IconButton`, a `<Label htmlFor>` on every input, an accessible name
on icon-only controls, and `DialogTitle`/`SheetTitle` on every overlay. Flag it
to the developer if a request would make something inaccessible.

### When nothing fits

Work down this ladder and stop at the first rung that works:

1. **Compose** existing components. Most "missing" components are a `Card` with a `SectionHeading` and a other components inside.
2. **Override with `className`.** Every component accepts it, styles are scoped with CSS Modules, and Tailwind utilities merge cleanly. This is sanctioned — use token-backed classes — but highly discouraged. If your user asks you to do it, note in the summary that they probably shouldn't.
3. **Build a local component out of tokens.** Keep it in the app's components directory, name it plainly, and use Equality's tokens and utilities so it still looks native. Add a comment saying which Equality component it wants to become.
4. **Never** restyle from scratch with arbitrary hex, `bg-blue-500`, or a duplicated Radix primitive. That is the failure this skill exists to prevent!

Reaching rung 3 is itself a signal. Say so in your summary — name the component
you had to fake — so the gap reaches the design system team.

### Validation

- Ensure props were match the docs, not guessed.
- Your design must survive dark mode and light modes — toggle it and look if you have browser tools.
- Every input has a label; every icon-only control has an accessible name; every dialog and sheet has a title.
- Nothing from the deprecated list in the index.

## Reference files

- <https://equality.eqtylab.io/llms.txt> — every component, import name,
  and purpose. Not bundled here, because the live copy is generated from the
  library and can't go stale. Start there!
- `references/setup.md` — installation, theming, portals, embedding, dark mode,
  and the failure modes for each.
