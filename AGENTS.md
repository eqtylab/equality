# Equality Design System

Equality is the design system for all EQTYLab projects. It is a monorepo composed of packages available under `packages`.

The "demo" package is Astro documentation site. Each component has a coorisponding MDX docs page under `packages/demo/src/content/components`.

The "tokens" package contains a design tokens formatted JSON file which is generated using Bjango's Pinwheel app. Tokens should always be added with Pinwheel and exported to JSON. Tokens are automatically built by the

The "ui" package contains our React components located under `ui/src/components/`.

## Development

Run `pnpm install` to get dependencies and `pnpm build` in the repo root to render the design tokens files to CSS and start the dev server.

## Guidance

- Always reference the `create-documentation` skill when interacting with component documentation MDX files.
- Always reference the `create-component` skill when creating a new component, or making changes in usability to an existing component.
- Strive to create accessible components that will function with keyboard navigation, screen reader usage, and accessible markup in mind. Alert the developer if they are specifically requesting that you implement something that won't be accessible.
