/**
 * Public MDX component surface.
 *
 * .astro only -- deliberately no .tsx in this barrel, because a React component
 * here would pull React into every page that imports anything at all.
 */
export { default as Callout } from './Callout.astro';
export { default as CodeFence } from './CodeFence.astro';
export { default as Link } from './Link.astro';
