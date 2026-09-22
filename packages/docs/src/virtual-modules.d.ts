/** Ambient declarations for modules the consumer's Vite graph supplies at runtime. */
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
    currentVersion: import('./internal/extract-versions.ts').CurrentVersion | null;
    versionManifest: import('./internal/extract-versions.ts').ManifestEntry[];
    versionRedirects: import('./versions.ts').VersionRedirect[];
  };
  export default config;
}

declare global {
  interface Window {
    /** Theme preference when `theme.persist` is false. */
    __eqtyDocsTheme?: string;
  }
}
