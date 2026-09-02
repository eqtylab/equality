/**
 * Ambient declarations for modules supplied by the consumer's Astro/Vite graph.
 * These exist at runtime but are not resolvable when type-checking the package
 * in isolation.
 */
declare module 'astro:content' {
  export function defineCollection(input: unknown): unknown;
  export function getCollection(
    collection: string,
    filter?: (entry: never) => unknown
  ): Promise<never[]>;
  export function getEntry(collection: string, id: string): Promise<never>;
  export function render(entry: unknown): Promise<{
    Content: unknown;
    headings: Array<{ depth: number; slug: string; text: string }>;
  }>;
}

declare module 'virtual:eqty-docs/config' {
  const config: import('./config.ts').DocsConfig & {
    env: import('./env.ts').DocsEnv;
    ownedByConsumer: string[];
  };
  export default config;
}
