# @eqtylab/equality

[![npm version](https://img.shields.io/npm/v/@eqtylab/equality)](https://www.npmjs.com/package/@eqtylab/equality)
[![license](https://img.shields.io/npm/l/@eqtylab/equality)](https://github.com/eqtylab/equality/blob/main/LICENSE)

EQTY Lab's design system: accessible React components and design tokens, built on Radix UI and Tailwind CSS v4.

**[Documentation](https://equality.eqtylab.io/)** · **[Components](https://equality.eqtylab.io/components/button/)** · **[GitHub](https://github.com/eqtylab/equality)**

## Installation

```bash
npm install @eqtylab/equality
# or
pnpm add @eqtylab/equality
# or
yarn add @eqtylab/equality
```

Requires `react` and `react-dom` 18.2 or newer.

## Setup

### Tailwind CSS v4 (recommended)

Import the theme config, then a preflight, in your global stylesheet:

```css
@import '@eqtylab/equality/theme-config.css';
@import '@eqtylab/equality/preflight.css' layer(base);
```

`theme-config.css` must come first, because it declares the layer order the preflight relies on. It builds on Tailwind, so `tailwindcss` v4 must be installed in your project.

| Stylesheet                               | Contains                                              |
| ---------------------------------------- | ----------------------------------------------------- |
| `@eqtylab/equality/theme-config.css`     | Tokens, theme, utilities and components. No reset.    |
| `@eqtylab/equality/preflight.css`        | Base styles reset for `html` and everything under it. |
| `@eqtylab/equality/preflight-scoped.css` | The same reset, only inside `[data-equality-root]`.   |

If you're embedding Equality in a site that has its own base styles, use `preflight-scoped.css` instead so the reset doesn't affect the rest of the page.

### Without Tailwind

Wrap your app, or the part of it that uses Equality, in `ThemeProvider`:

```tsx
import { ThemeProvider } from '@eqtylab/equality';

export function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
```

See the [Usage guide](https://equality.eqtylab.io/getting-started/usage/) for embedding in host sites, shadow DOM, and portalled surfaces.

## Usage

```tsx
import { Button, Card, CardContent } from '@eqtylab/equality';

export function Example() {
  return (
    <Card>
      <CardContent>
        <Button>Save changes</Button>
      </CardContent>
    </Card>
  );
}
```

Every component accepts a `className` prop for local style overrides. Component styles are scoped with CSS Modules, so overrides don't leak into other components.

## Themes

Equality ships `light` and `dark` themes. Set the active theme on the root element:

```html
<html data-equality-theme="dark"></html>
```

To apply a stored or system preference before first paint, inline the `initializeTheme` script in your document `<head>`:

```tsx
import { initializeTheme } from '@eqtylab/equality/scripts';

<head>
  <script>{initializeTheme()}</script>
</head>;
```

See [Themes](https://equality.eqtylab.io/getting-started/themes/) for options.

## Entry points

| Import path                              | Contents                                           |
| ---------------------------------------- | -------------------------------------------------- |
| `@eqtylab/equality`                      | Components, `ThemeProvider`, and hooks             |
| `@eqtylab/equality/scripts`              | `initializeTheme` inline script for theme startup  |
| `@eqtylab/equality/syntax-language`      | File name to syntax grammar mapping for CodeBlock  |
| `@eqtylab/equality/theme-config.css`     | Tailwind v4 theme config                           |
| `@eqtylab/equality/preflight.css`        | Global base styles reset                           |
| `@eqtylab/equality/preflight-scoped.css` | Base styles reset scoped to `[data-equality-root]` |

The package ships ES modules and CommonJS builds with TypeScript types.

## Accessibility

Components are built on [Radix UI](https://www.radix-ui.com/) primitives and designed for keyboard navigation and screen readers.

## License

[Apache-2.0](https://github.com/eqtylab/equality/blob/main/LICENSE)
