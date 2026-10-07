import { ICON_NAME, type DocsConfig } from '../config.ts';

// Only the areas LinkIcon draws. The sidebar draws its icons through Equality's Icon with
// Lucide's own names, and plugins may carry unrelated `icon` fields, so walking the whole config
// would look up names nothing renders, or fail the build on them.
export function configuredIcons(cfg: DocsConfig): string[] {
  const names = new Set<string>();
  for (const link of [...cfg.header.links, ...cfg.footer.links]) {
    if (link.icon && ICON_NAME.test(link.icon)) names.add(link.icon);
  }
  return [...names];
}
