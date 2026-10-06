import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import type { IconifyJSON } from '@iconify/types';
import { getIconData, iconToSVG } from '@iconify/utils';

export interface IconSvg {
  viewBox: string;
  body: string;
}

// The sets are dependencies of this package. Under pnpm a site cannot resolve them from its
// own folder, so they must load through this module's require.
const ownRequire = createRequire(import.meta.url);
const sets = new Map<string, IconifyJSON>();

function loadSet(set: string): IconifyJSON {
  let collection = sets.get(set);
  if (!collection) {
    const path = ownRequire.resolve(`@iconify-json/${set}/icons.json`);
    collection = JSON.parse(readFileSync(path, 'utf8')) as IconifyJSON;
    sets.set(set, collection);
  }
  return collection;
}

// No replaceIDs: it adds a random prefix, so every build's HTML would differ. Neither bundled
// set uses ids. Revisit if a set that does is added.
export function resolveIcons(names: Iterable<string>): Record<string, IconSvg> {
  const icons: Record<string, IconSvg> = {};
  for (const name of new Set(names)) {
    const [set, icon] = name.split(':');
    const data = getIconData(loadSet(set), icon);
    if (!data) throw new Error(`[@eqtylab/docs] Icon "${name}" not found in the ${set} set`);
    const svg = iconToSVG(data);
    icons[name] = { viewBox: svg.attributes.viewBox, body: svg.body };
  }
  return icons;
}

let lucideByOldName: Map<string, string> | undefined;

/** `BookOpen` → `lucide:book-open`, only for names that exist. Guessing from the capitals gets `Grid3x3` wrong. */
export function lucideNameFor(oldName: string): string | undefined {
  if (!lucideByOldName) {
    const lucide = loadSet('lucide');
    const toOldName = (name: string) =>
      name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    lucideByOldName = new Map(
      [...Object.keys(lucide.icons), ...Object.keys(lucide.aliases ?? {})].map((name) => [
        toOldName(name),
        name,
      ])
    );
  }
  const name = lucideByOldName.get(oldName);
  return name && `lucide:${name}`;
}
