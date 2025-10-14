# equality

EQTY's design system — a shared component library and demo app.

## Prerequisites

- Node 18+ (Vite 5 requires Node ≥ 18)
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

- Start demo (Vite dev server):

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

2. Import the library CSS once (ideally in your app entry):

```ts
import '@eqtylab/equality/styles/style.css';
```

3. Import and use components:

```ts
import { Button, Card } from '@eqtylab/equality';
```

4. Optional: wrap a top-level container with the `equality` class to scope styles/utilities:

```tsx
<div className="equality">
  <Button>Click me</Button>
</div>
```

Notes:

- The library is built with Tailwind v4. If your app uses Tailwind, use v4 for best compatibility.
- The prebuilt CSS works without configuring Tailwind in the consuming app.

## Developing the UI library

- Source: `packages/ui/src` (components under `src/components`, exports in `src/index.ts`)
- Styles/Tokens: `packages/ui/styles/tailwind.css` (compiled to `styles/style.css`)

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

The root has a convenience script that builds and publishes the UI package:

```bash
pnpm release
```

Requirements:

- You must be authenticated with npm and have publish rights.
- Ensure you have updated the version in `packages/ui/package.json` before releasing.

Alternatively, run the package-level release:

```bash
pnpm -F @eqtylab/equality run release
```

## Troubleshooting

- If the demo doesn’t start, ensure Node ≥ 18 and pnpm ≥ 9.
- If styles don’t appear, confirm the CSS import: `import '@eqtylab/equality/styles/style.css'`.
