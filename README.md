# Equality

[![Deploy Equality Docs](https://github.com/eqtylab/equality/actions/workflows/docs.yaml/badge.svg)](https://github.com/eqtylab/equality/actions/workflows/docs.yaml)
[![Publish Equality Package](https://github.com/eqtylab/equality/actions/workflows/publish.yaml/badge.svg)](https://github.com/eqtylab/equality/actions/workflows/publish.yaml)
[![Code Quality Checks](https://github.com/eqtylab/equality/actions/workflows/code-quality.yaml/badge.svg)](https://github.com/eqtylab/equality/actions/workflows/code-quality.yaml)

EQTY Lab's design system — accessible React components and design tokens, built on Radix UI and Tailwind CSS v4.

## Prerequisites

- Node 22.12+ (Astro 6 requires Node ≥ 22.12.0)
- pnpm 9.x (workspace uses `packageManager: pnpm@9.12.3`)

Verify versions:

```bash
node -v
pnpm -v
```

## Install

From the repository root:

```bash
pnpm install
```

This installs all workspace packages under `packages/`.

## Useful commands (from repo root)

- Start dev servers (Astro docs site + design token watcher):

  ```bash
  pnpm dev
  ```

- Build everything (UI lib and any other packages):

  ```bash
  pnpm build
  ```

- Build only the UI library package:

  ```bash
  pnpm -F @eqtylab/equality build
  ```

- Format code with Prettier:
  ```bash
  pnpm format
  pnpm format:check
  ```

You can also run commands within individual packages, e.g. the demo:

```bash
pnpm -F demo dev
```

## Project structure

- `packages/ui` — the published component library `@eqtylab/equality`
- `packages/demo` — Vite + React demo app consuming the library

## Using the library (in the demo or another app)

1. Install the package (within your app workspace):

```bash
pnpm add @eqtylab/equality
```

2. Add theme styles, either via the Tailwind v4 config import in your global CSS (recommended if using Tailwind v4) or by importing `ThemeProvider` in your app entry:

```css
@import '@eqtylab/equality/theme-config.css';
@import '@eqtylab/equality/preflight.css' layer(base);
```

See the [Usage guide](https://equality.eqtylab.io/getting-started/usage) for the available stylesheets and how to embed Equality in a site that has its own base styles.

Or

```ts
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@eqtylab/equality';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

3. Import and use components:

```ts
import { Button, Card } from '@eqtylab/equality';

const Test = () => {
  return (
    <Card>
      <CardContent>
        <p>This is a test card with button</p>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  )
}
```

Notes:

- The prebuilt CSS works without configuring Tailwind in the consuming app.

## Developing the UI library

- Source: `packages/ui/src` (components under `src/components`, exports in `src/index.ts`)
- Styles/Tokens: `packages/ui/src/theme/theme.module.css`

Build the library locally:

```bash
pnpm -F @eqtylab/equality build
```

Watch mode (library only):

```bash
pnpm -F @eqtylab/equality watch
```

Then, in another terminal, run the demo to test changes:

```bash
pnpm -F demo dev
```

## Releasing the library

Releases are automatically published to GitHub Packages when changes to `packages/ui/package.json` are pushed to `main`.

To release manually from the command line:

```bash
pnpm release
```

Requirements:

- You must be authenticated with GitHub Packages and have publish rights.
- Ensure you have updated the version in `packages/ui/package.json` before releasing.

## Troubleshooting

- If the demo doesn’t start, ensure Node ≥ 18 and pnpm ≥ 9.
- If styles don't appear, confirm the CSS imports listed in the [Usage guide](https://equality.eqtylab.io/getting-started/usage).
