# Generated CSS Variables

This directory contains auto-generated CSS variables from `packages/tokens/equality-tokens.json`.

## Files

- `light-tokens.css` - CSS variables for the Light theme
- `dark-tokens.css` - CSS variables for the Dark theme
- `tailwind-tokens.css` - Tailwind theme variables

## Usage

These variables are imported in `theme/tokens.css`. You can import this file into your theme file. For example, in `theme.module.css`:

```css
@import './tokens.css';
```

## Regenerating

To regenerate these files after updating `equality-tokens.json`:

```bash
pnpm run build:tokens
```

Or it will run automatically as part of:

```bash
pnpm run build
```

## Token Naming

Tokens are named using kebab-case based on their path in the JSON:

- `Light.color.amber.100` → `--color-amber-100`
- `Light.color.background` → `--color-background`
- `Light.color.blue.500` → `--color-blue-500`

All color values are exported as `color()` syntax using Display-P3 or other color spaces, including channel values (e.g., `color(display-p3 0.1475 0.2946 0.2434)`), using hex as a fallback (e.g., `#264b3eff`).
