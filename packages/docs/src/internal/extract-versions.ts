/**
 * Reads release tags and pulls each pick's content directory out of git into the cache.
 * Runs once per build or dev start, inside `astro:config:setup`, before the content layer syncs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  groupOf,
  highestTag,
  idOf,
  parseTag,
  selectVersions,
  type Granularity,
  type VersionRedirect,
} from '../versions.ts';

export interface ExtractOptions {
  root: string;
  contentDirAbs: string;
  cacheDir: string;
  current?: string;
  tags: string;
  granularity: Granularity;
  logger: { info(msg: string): void; warn(msg: string): void };
}

export interface CurrentVersion {
  id: string;
  group: string;
  version: string;
}

export interface ManifestEntry {
  id: string;
  suffix: string;
  group: string;
  tag: string;
  /** Filesystem path of the extracted content directory. */
  dir: string;
}

export interface ExtractResult {
  currentVersion: CurrentVersion | null;
  versionManifest: ManifestEntry[];
  versionRedirects: VersionRedirect[];
}

export const EMPTY_VERSIONS: ExtractResult = {
  currentVersion: null,
  versionManifest: [],
  versionRedirects: [],
};

const TAG = '[@eqtylab/docs] versions:';

function git(cwd: string, ...args: string[]): string {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

/**
 * git reports resolved paths, so a project reached through a symlink (macOS `/tmp`, a linked
 * home, a linked workspace) yields a relative path full of `..` and matches no tag. The failure
 * is silent: every group looks like it predates the content directory and gets skipped.
 */
function realpath(p: string): string {
  try {
    return fs.realpathSync(p);
  } catch {
    return p;
  }
}

function hasPathAtTag(repoRoot: string, tag: string, rel: string): boolean {
  try {
    execFileSync('git', ['cat-file', '-e', `${tag}:${rel}`], { cwd: repoRoot, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function extractVersions(o: ExtractOptions): ExtractResult {
  let repoRoot: string;
  try {
    repoRoot = git(o.root, 'rev-parse', '--show-toplevel');
  } catch {
    o.logger.warn(
      `${TAG} not a git repository, or git is missing. Versioning is off for this build.`
    );
    return EMPTY_VERSIONS;
  }

  if (git(o.root, 'rev-parse', '--is-shallow-repository') === 'true') {
    o.logger.warn(`${TAG} shallow clone; tags may be incomplete. Check out with fetch-depth: 0.`);
  }

  const tags = git(o.root, 'tag', '--list', o.tags).split('\n').filter(Boolean);
  const currentVersion = o.current ?? highestTag(tags)?.version;
  if (!currentVersion) {
    o.logger.info(
      `${TAG} on and dormant. No tag matches "${o.tags}"; versioning activates at the first release tag.`
    );
    return EMPTY_VERSIONS;
  }

  const contentRel = path
    .relative(realpath(repoRoot), realpath(o.contentDirAbs))
    .split(path.sep)
    .join('/');

  let selection = selectVersions(tags, currentVersion, o.granularity);
  for (const tag of selection.skipped) {
    o.logger.warn(`${TAG} tag "${tag}" is not MAJOR.MINOR.PATCH; skipped.`);
  }
  if (selection.above.length) {
    o.logger.warn(
      `${TAG} tags above current ${currentVersion} ignored: ${selection.above.join(', ')}.`
    );
  }

  // A pick whose tree predates the content directory takes its whole group out, and selection
  // re-runs so that group's releases redirect lower. One pass suffices: skipping never adds groups.
  const missing = selection.copies.filter((c) => !hasPathAtTag(repoRoot, c.tag, contentRel));
  if (missing.length) {
    for (const c of missing) {
      o.logger.warn(
        `${TAG} ${c.tag} has no ${contentRel}; skipping ${c.id}. Its releases redirect to the copy below.`
      );
    }
    selection = selectVersions(
      tags,
      currentVersion,
      o.granularity,
      missing.map((c) => c.group)
    );
  }

  const versionsDir = path.join(o.cacheDir, 'versions');
  fs.rmSync(versionsDir, { recursive: true, force: true });
  const versionManifest: ManifestEntry[] = selection.copies.map((c) => {
    const dir = path.join(versionsDir, c.id);
    fs.mkdirSync(dir, { recursive: true });
    // `<tag>:<path>` makes the path the archive root, so there is nothing to strip.
    execFileSync('sh', ['-c', 'git archive "$0:$1" | tar -x -C "$2"', c.tag, contentRel, dir], {
      cwd: repoRoot,
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    return { ...c, dir };
  });

  const cur = parseTag(currentVersion)!;
  const group = groupOf(cur, o.granularity);
  const result: ExtractResult = {
    currentVersion: { id: idOf(group), group, version: cur.version },
    versionManifest,
    versionRedirects: selection.redirects,
  };

  fs.mkdirSync(o.cacheDir, { recursive: true });
  fs.writeFileSync(path.join(o.cacheDir, 'versions.json'), JSON.stringify(result, null, 2));
  o.logger.info(
    `${TAG} current ${result.currentVersion!.id}; ${versionManifest.length} older ${
      versionManifest.length === 1 ? 'copy' : 'copies'
    }, ${selection.redirects.length} redirects.`
  );
  return result;
}
