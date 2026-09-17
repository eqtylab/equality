/**
 * Dev-only source linking: redirects a workspace package's specifiers to its
 * source tree so edits hot-reload. Subpaths derive from the package's `exports`.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { globSync } from 'tinyglobby';
import type { Plugin } from 'vite';

export interface LinkOptions {
  /** Package name -> path to its package root, relative to the consumer project. */
  [packageName: string]: string;
}

interface LinkedPackage {
  name: string;
  srcDir: string;
  /** Subpath (e.g. 'theme-config.css') -> absolute file under src/. */
  subpaths: Map<string, string>;
}

/** For each `exports` subpath targeting dist/, find the same basename under src/. */
function invertExports(pkgRoot: string, pkgName: string): LinkedPackage | null {
  const manifestPath = path.join(pkgRoot, 'package.json');
  if (!existsSync(manifestPath)) return null;

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    exports?: Record<string, unknown>;
  };
  const srcDir = path.join(pkgRoot, 'src');
  if (!existsSync(srcDir)) return null;

  const subpaths = new Map<string, string>();
  const candidates = globSync(['**/*.{css,ts,tsx}'], { cwd: srcDir, absolute: false });
  const byBasename = new Map<string, string[]>();
  for (const rel of candidates) {
    const key = path.basename(rel);
    const list = byBasename.get(key);
    if (list) list.push(rel);
    else byBasename.set(key, [rel]);
  }

  const targetOf = (value: unknown): string | undefined => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const conditions = value as Record<string, unknown>;
      for (const key of ['import', 'default', 'require']) {
        const nested = targetOf(conditions[key]);
        if (nested) return nested;
      }
    }
    return undefined;
  };

  for (const [subpath, value] of Object.entries(manifest.exports ?? {})) {
    if (subpath === '.' || subpath === './package.json' || subpath.includes('*')) continue;
    const target = targetOf(value);
    if (!target) continue;

    const basename = path.basename(target);
    const matches = byBasename.get(basename);
    if (!matches || matches.length === 0) continue;
    if (matches.length > 1) {
      matches.sort((a, b) => a.split('/').length - b.split('/').length);
    }
    subpaths.set(subpath.replace(/^\.\//, ''), path.join(srcDir, matches[0] as string));
  }

  return { name: pkgName, srcDir, subpaths };
}

export function linkWorkspacePackages(options: LinkOptions): Plugin[] {
  const linked: LinkedPackage[] = [];

  for (const [name, relativeRoot] of Object.entries(options)) {
    const pkgRoot = path.resolve(process.cwd(), relativeRoot);
    const entry = invertExports(pkgRoot, name);
    if (entry) linked.push(entry);
  }

  if (linked.length === 0) return [];

  const resolver: Plugin = {
    name: 'eqty-docs:link-workspace-source',
    enforce: 'pre',
    async resolveId(id, importer, opts) {
      for (const pkg of linked) {
        let target: string | undefined;

        if (id === pkg.name) {
          target = pkg.srcDir; // directory -> index.ts
        } else if (id.startsWith(`${pkg.name}/`)) {
          const subpath = id.slice(pkg.name.length + 1);
          target = pkg.subpaths.get(subpath) ?? path.join(pkg.srcDir, subpath);
        }

        if (!target) continue;
        // Vite still handles directory and extension resolution.
        const resolved = await this.resolve(target, importer, { ...opts, skipSelf: true });
        return resolved ?? target;
      }
      return null;
    },
  };

  const watcher: Plugin = {
    name: 'eqty-docs:watch-workspace-source',
    configureServer(server) {
      for (const pkg of linked) server.watcher.add(pkg.srcDir);
    },
  };

  return [resolver, watcher];
}
