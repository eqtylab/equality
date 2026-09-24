/** Must agree with the docs glob pattern in `loaders.ts`: in dev this, not the glob, decides what is a page. */
export function isDocsEntryPath(rel: string): boolean {
  const segments = rel.split(/[\\/]/);
  return (
    rel.endsWith('.mdx') && !segments.some((segment) => segment.startsWith('_') || segment === '..')
  );
}
