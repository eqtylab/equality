# Generated CSS Variables

This directory contains auto-generated CSS variables from `packages/tokens/equality-tokens.json`.

## Files

- `light-tokens.css` - CSS variables for the Light theme
- `dark-tokens.css` - CSS variables for the Dark theme

## Usage

You can import these variables into your theme file. For example, in `theme.module.css`:

```css
/* Light theme */
.root {
  /* Import generated tokens */
  @import './generated/light-tokens.css';
  /* ... */
}

/* Dark theme */
.root[data-eqty-theme='dark'] {
  @import './generated/dark-tokens.css';
  /* ... */
}
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

- `Light.amber.100` → `--amber-100`
- `Light.background` → `--background`
- `Light.blue.500` → `--blue-500`

All color values are exported as `color()` syntax using Display-P3 or other color spaces, including channel values and a fallback hex (e.g., `color(display-p3 0.1475 0.2946 0.2434, #264b3eff)`).
