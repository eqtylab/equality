/**
 * Reads release tags and pulls each pick's content directory out of git into the cache.
 * Runs once per build or dev start, inside `astro:config:setup`, before the content layer syncs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import {
  compareTags,
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
  /** 'folders': old versions and the current release come from `folders`; tags are optional. */
  source?: 'tags' | 'folders';
  tags: string;
  granularity: Granularity;
  folders?: Record<string, string>;
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
const FOLDER = 'folder:';

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
  // With source 'folders' the current release comes from the highest folder key, so every host
  // builds the same versions whether or not its clone has tags. Vercel's clone has none.
  const fromFolders = o.source === 'folders';
  const folders = Object.entries(o.folders ?? {});
  if (fromFolders && !folders.length) {
    throw new Error(`${TAG} source: 'folders' needs folders`);
  }

  let repoRoot: string | null = null;
  try {
    repoRoot = git(o.root, 'rev-parse', '--show-toplevel');
  } catch {
    if (!fromFolders) {
      o.logger.warn(
        `${TAG} not a git repository, or git is missing. Versioning is off for this build.`
      );
      return EMPTY_VERSIONS;
    }
    o.logger.info(`${TAG} not a git repository; building versions from folders alone.`);
  }

  const shallow =
    repoRoot !== null && git(o.root, 'rev-parse', '--is-shallow-repository') === 'true';
  // Tags are optional when current comes from folders, so a shallow clone is not a problem there.
  if (shallow && !fromFolders) {
    o.logger.warn(`${TAG} shallow clone; tags may be incomplete. Check out with fetch-depth: 0.`);
  }

  const tags =
    repoRoot === null ? [] : git(o.root, 'tag', '--list', o.tags).split('\n').filter(Boolean);

  // Validated before anything reads them, so a bad key fails even on a dormant site.
  for (const [version, dir] of folders) {
    if (parseTag(version)?.version !== version) {
      throw new Error(`${TAG} folders key "${version}" is not MAJOR.MINOR.PATCH`);
    }
    // Checked here, not when copied, so a folder that waits as the current release fails too.
    const src = path.resolve(o.root, dir);
    if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
      throw new Error(`${TAG} folders ${version}: ${dir} is not a directory`);
    }
  }

  // In folders mode the highest folder becomes the current release, so a mistyped key would
  // relabel the whole site. Do not make this an error: a full-history clone can still hold only
  // some tags (`clone --no-tags`, then one `fetch origin tag`), and valid builds would fail. Other
  // modes keep untagged folders (a release converted by hand) and catch a folder above `current`
  // in the group check below.
  const topTag = highestTag(tags);
  const topFolder = highestTag(folders.map(([v]) => v));
  if (
    fromFolders &&
    repoRoot !== null &&
    !shallow &&
    topTag &&
    topFolder &&
    compareTags(topFolder, topTag) > 0
  ) {
    o.logger.warn(
      `${TAG} folders ${topFolder.version} is above every release tag in this clone (${topTag.tag} is the highest); a typo, or tags not fetched?`
    );
  }

  const currentVersion = o.current ?? (fromFolders ? topFolder!.version : topTag?.version);
  if (!currentVersion) {
    o.logger.info(
      `${TAG} on and dormant. No tag matches "${o.tags}"; versioning activates at the first release tag.`
    );
    if (folders.length) {
      o.logger.warn(
        `${TAG} ${folders.length} folders listed but versioning is dormant; set source: 'folders' to serve them without tags.`
      );
    }
    return EMPTY_VERSIONS;
  }

  const contentRel =
    repoRoot === null
      ? ''
      : path.relative(realpath(repoRoot), realpath(o.contentDirAbs)).split(path.sep).join('/');

  // A folder stands in for its release's tag, even when the tag has pages: the release job saves
  // each release as its group's folder, replacing the previous patch's, because the tag lacks
  // what only the release run produces. The release keeps exactly one redirect.
  const folderVersions = new Set(folders.map(([v]) => v));
  const selectionTags = [
    ...tags.filter((t) => !folderVersions.has(parseTag(t)?.version ?? '')),
    ...folders.map(([v]) => `${FOLDER}${v}`),
  ];

  let selection = selectVersions(selectionTags, currentVersion, o.granularity);
  for (const tag of selection.skipped) {
    o.logger.warn(`${TAG} tag "${tag}" is not MAJOR.MINOR.PATCH; skipped.`);
  }
  if (selection.above.length) {
    const above = selection.above.map((t) => (t.startsWith(FOLDER) ? t.slice(FOLDER.length) : t));
    const one = above.length === 1;
    o.logger.warn(
      fromFolders
        ? `${TAG} ${above.join(', ')} ${one ? 'has' : 'have'} no folder yet; the site shows ${currentVersion} as current until ${one ? 'its folder is' : 'their folders are'} saved.`
        : `${TAG} tags above current ${currentVersion} ignored: ${above.join(', ')}.`
    );
  }

  // A pick whose tree predates the content directory takes its whole group out, and selection
  // re-runs so that group's releases redirect lower. One pass suffices: skipping never adds groups.
  const missing = selection.copies.filter(
    (c) => !c.tag.startsWith(FOLDER) && !hasPathAtTag(repoRoot!, c.tag, contentRel)
  );
  if (missing.length) {
    for (const c of missing) {
      o.logger.warn(
        `${TAG} ${c.tag} has no ${contentRel}; skipping ${c.id}. Its releases redirect to the copy below.`
      );
    }
    selection = selectVersions(
      selectionTags,
      currentVersion,
      o.granularity,
      missing.map((c) => c.group)
    );
  }

  // A copy made from a tag exists only where the clone has tags, so hosts without them would
  // build a different site: the one thing folders mode promises not to do.
  if (fromFolders) {
    for (const c of selection.copies) {
      if (c.tag.startsWith(FOLDER)) continue;
      o.logger.warn(
        `${TAG} ${c.id} is copied from tag ${c.tag}; hosts without tags won't have it. To build the same everywhere, save a folder for it.`
      );
    }
  }

  // Every folder must become its group's copy. One that is not the newest release of its group
  // would otherwise be dropped with the group, and its pages would silently not ship.
  const currentGroup = groupOf(parseTag(currentVersion)!, o.granularity);
  for (const [version] of folders) {
    if (selection.copies.some((c) => c.tag === `${FOLDER}${version}`)) continue;
    const g = groupOf(parseTag(version)!, o.granularity);
    // Saved on release, while its group is still current: served once a newer release makes it old.
    if (g === currentGroup) {
      if (version === currentVersion) {
        o.logger.info(
          `${TAG} folders ${version} is the current release; served once a newer one ships.`
        );
      } else {
        // Normal between a patch's tag and the PR that saves it; fatal once the next group ships.
        o.logger.warn(
          `${TAG} folders ${version} is not current ${currentVersion} of ${idOf(g)}; the build fails once a newer group ships unless it is replaced.`
        );
      }
      continue;
    }
    const newest = tags
      .map(parseTag)
      .filter((p): p is NonNullable<typeof p> => !!p && groupOf(p, o.granularity) === g)
      .sort((a, b) => a.major - b.major || a.minor - b.minor || a.patch - b.patch)
      .pop();
    throw new Error(
      `${TAG} folders ${version} is not the newest release of ${idOf(g)}${
        newest ? ` (${newest.tag} is)` : ''
      }, or is not below current ${currentVersion}`
    );
  }

  const versionsDir = path.join(o.cacheDir, 'versions');
  fs.rmSync(versionsDir, { recursive: true, force: true });
  const versionManifest: ManifestEntry[] = selection.copies.map((c) => {
    const dir = path.join(versionsDir, c.id);
    fs.mkdirSync(dir, { recursive: true });
    if (c.tag.startsWith(FOLDER)) {
      const version = c.tag.slice(FOLDER.length);
      fs.cpSync(path.resolve(o.root, o.folders![version]!), dir, { recursive: true });
    } else {
      // Two processes rather than a shell pipeline: a pipeline reports only tar's status, so a
      // failed `git archive` left an empty directory, a manifest entry pointing at it, and a build
      // that succeeded with a version serving zero pages. `set -o pipefail` would fix that on
      // macOS and break it on CI, where /bin/sh is dash and rejects the option outright.
      try {
        // `<tag>:<path>` makes the path the archive root, so there is nothing to strip.
        const archive = execFileSync('git', ['archive', `${c.tag}:${contentRel}`], {
          cwd: repoRoot!,
          maxBuffer: 512 * 1024 * 1024,
          stdio: ['ignore', 'pipe', 'inherit'],
        });
        execFileSync('tar', ['-x', '-C', dir], {
          input: archive,
          stdio: ['pipe', 'ignore', 'inherit'],
        });
      } catch (cause) {
        throw new Error(`${TAG} ${c.tag} failed to extract ${contentRel} into ${dir}`, { cause });
      }
    }
    // A content path that is a file rather than a directory passes `cat-file -e` and yields an
    // archive of nothing, so the exit status alone is not enough.
    if (!fs.readdirSync(dir).length) {
      throw new Error(`${TAG} ${c.tag} extracted no files into ${dir}`);
    }
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
