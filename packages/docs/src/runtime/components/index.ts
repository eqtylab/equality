/**
 * Public component surface for MDX authors.
 *
 * Deliberately thin. Content elements are Equality components, provided to MDX
 * through the route-level component map (see lib/mdx-components.ts) so authors
 * write `<Alert>` and plain markdown tables with no imports and no
 * docs-specific components to learn.
 *
 * .astro only -- a React component in this barrel would pull React into every
 * page that imports anything at all.
 */
export { default as Link } from './Link.astro';
