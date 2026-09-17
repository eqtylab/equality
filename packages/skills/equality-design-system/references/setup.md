# Setup and theming

Getting Equality into a new app, and the things that can go wrong.

## Before you install

Equality ships React components. The target has to be a React app or a framework that accepts React components (Astro, for instance) — if it isn't, tell the user and suggest a framework the org actually uses.

## Install

```bash
pnpm add @eqtylab/equality
```

Published publicly on npm. Peer dependencies are React 18.2+ or 19. The package brings its own Radix, Lucide, `react-hook-form`, `motion`, and `cmdk` — you don't install those separately unless you import from them directly.

## Theming: pick one path

### Tailwind v4 (preferred)

If the prototype uses Tailwind v4, import the theme config so your own markup can use the same tokens the components do. In your global stylesheet:

```css
@import '@eqtylab/equality/theme-config.css';
@import '@eqtylab/equality/preflight.css' layer(base);
```

Order matters. `theme-config.css` declares the `theme, base, components, utilities` layer order the preflight relies on; flip them and the reset lands in the wrong layer.

Three stylesheets ship:

| Stylesheet                               | Contains                                            |
| ---------------------------------------- | --------------------------------------------------- |
| `@eqtylab/equality/theme-config.css`     | Tokens, theme, utilities, components. No reset.     |
| `@eqtylab/equality/preflight.css`        | Base reset for `html` and everything under it.      |
| `@eqtylab/equality/preflight-scoped.css` | The same reset, only inside `[data-equality-root]`. |

### Anything else

Without Tailwind, wrap the app in the provider, which injects the tokens as CSS variables on its own root element:

```tsx
import { ThemeProvider } from '@eqtylab/equality';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
```

Components each ship their own scoped CSS Module, so there is no global component stylesheet to import either way.

## Portalled surfaces

Tooltips, popovers, selects, dialogs, sheets, drawers, and dropdown menus render into a portal. `ThemeProvider` creates and supplies that container, which keeps those surfaces inside the themed subtree.

**If a dropdown or dialog renders unstyled, you almost certainly have no `ThemeProvider`.** That is the single most common setup failure.

Two cases need you to supply the container yourself:

- **Shadow DOM** — the default document lookup can't see into a shadow root, so portalled surfaces escape the boundary.
- **More than one theme root on a page** — the second root's portals can otherwise land inside the first one's container.

```tsx
<ThemeProvider portalContainer={myElement}>
  <App />
</ThemeProvider>
```

`portalContainer={null}` portals to `document.body`. To supply a container without rendering a `ThemeProvider`, use the exported `PortalContainerProvider`.

## Dark mode

The dark palette activates on `html[data-equality-theme="dark"]`.

Read and set it with the hook:

```tsx
import { useTheme } from '@eqtylab/equality';

const [theme, setTheme] = useTheme();

<Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle theme</Button>;
```

`theme` is `'light' | 'dark' | undefined` — undefined before hydration, so guard against it in SSR rather than assuming a value.

**Always check your work in both themes.** Dark mode is where hardcoded colours show up, and it is the fastest way to catch a component that was hand-rolled instead of imported.

## Embedding in a site with its own styles

The global preflight is a document-wide reset and will flatten the typography of a host that ships its own base styles — a Starlight or Zensical docs site, a marketing page, etc. Use the scoped preflight instead:

```css
@import '@eqtylab/equality/theme-config.css';
@import '@eqtylab/equality/preflight-scoped.css' layer(base);
```

The scoped reset applies inside `[data-equality-root]`. `ThemeProvider` sets that
attribute for you; you can also mark plain wrappers, as many per page as needed:

```html
<div data-equality-root>…</div>
```

Neither preflight declares a layer of its own, so `layer()` places the reset
wherever the host cascade needs it — `layer(equality-reset)`, ordered against the
host's own layers, for instance.

A host's theme toggle won't set `data-equality-theme`, so mirror its attribute:

```js
const html = document.documentElement;
new MutationObserver(() => {
  html.dataset.equalityTheme = html.dataset.theme;
}).observe(html, { attributes: true, attributeFilter: ['data-theme'] });
```

## Troubleshooting

| Symptom                                      | Cause                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| Dropdowns, dialogs, tooltips render unstyled | No `ThemeProvider`, or a portal container is needed (shadow DOM, multiple roots) |
| Host site's typography collapsed             | Global preflight used where the scoped one belongs                               |
| Reset applied but tokens missing             | `preflight.css` imported before `theme-config.css`                               |
| Dark mode does nothing                       | `html[data-equality-theme="dark"]` isn't being set; mirror the host's toggle     |
| Components look right, custom markup doesn't | Custom markup is using palette or literal colours instead of semantic tokens     |

Full usage guide: <https://equality.eqtylab.io/getting-started/usage>
