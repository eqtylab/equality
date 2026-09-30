import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { extractVersions } from '../src/internal/extract-versions.ts';

const CONTENT = 'packages/demo/src/content/docs';

function logger() {
  const lines: string[] = [];
  return {
    lines,
    info: (m: string) => lines.push(`info: ${m}`),
    warn: (m: string) => lines.push(`warn: ${m}`),
  };
}

function sh(cwd: string, ...args: string[]) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

/** A repo with three releases. 2.0.0 has no content directory, as a real pre-conversion tag would not. */
function fixture() {
  const repo = mkdtempSync(path.join(tmpdir(), 'eqty-docs-versions-'));
  sh(repo, 'init', '-q');
  sh(repo, 'config', 'user.email', 't@t');
  sh(repo, 'config', 'user.name', 't');
  const doc = path.join(repo, CONTENT, 'a.mdx');

  writeFileSync(path.join(repo, 'README'), 'v2, no docs yet');
  sh(repo, 'add', '-A');
  sh(repo, 'commit', '-qm', 'v2');
  sh(repo, 'tag', 'v2.0.0');

  mkdirSync(path.dirname(doc), { recursive: true });
  writeFileSync(doc, '---\ntitle: A\n---\nthree');
  sh(repo, 'add', '-A');
  sh(repo, 'commit', '-qm', 'v3');
  sh(repo, 'tag', 'v3.0.0');

  writeFileSync(doc, '---\ntitle: A\n---\nfour');
  sh(repo, 'add', '-A');
  sh(repo, 'commit', '-qm', 'v4');
  sh(repo, 'tag', 'v4.0.0');
  // Matches the glob and fails the semver parse, which is the pair that produces the skip warning.
  sh(repo, 'tag', 'v-nightly');

  const root = path.join(repo, 'packages/demo');
  return {
    repo,
    root,
    opts: (extra: Partial<Parameters<typeof extractVersions>[0]> = {}) => ({
      root,
      contentDirAbs: path.join(repo, CONTENT),
      cacheDir: path.join(root, '.astro/eqty-docs'),
      tags: 'v*',
      granularity: 'major' as const,
      logger: logger(),
      ...extra,
    }),
  };
}

test('extracts the highest tag per major below current into the cache dir', () => {
  const f = fixture();
  const opts = f.opts({ current: '4.0.0' });
  const result = extractVersions(opts);
  assert.deepEqual(result.currentVersion, { id: 'v4', group: '4', version: '4.0.0' });
  assert.deepEqual(
    result.versionManifest.map((m) => [m.id, m.suffix, m.tag]),
    [['v3', 'v3', 'v3.0.0']]
  );
  assert.equal(
    readFileSync(path.join(f.root, '.astro/eqty-docs/versions/v3/a.mdx'), 'utf8'),
    '---\ntitle: A\n---\nthree'
  );
  // v2 has no content dir at its tag: skipped with a warning, its release redirects to latest.
  assert.ok(
    opts.logger.lines.some(
      (l) => l.startsWith('warn:') && l.includes('v2.0.0') && l.includes(CONTENT)
    )
  );
  assert.deepEqual(result.versionRedirects, [
    { id: 'v2.0.0', to: null },
    { id: 'v3.0.0', to: 'v3' },
    { id: 'v4.0.0', to: null },
    { id: 'v4', to: null },
  ]);
  assert.ok(opts.logger.lines.some((l) => l.includes('nightly')));
});

test('current defaults to the highest tag', () => {
  const f = fixture();
  const result = extractVersions(f.opts());
  assert.equal(result.currentVersion?.version, '4.0.0');
});

test('no matching tags is dormant, not an error', () => {
  const f = fixture();
  const opts = f.opts({ tags: 'release-*' });
  const result = extractVersions(opts);
  assert.equal(result.currentVersion, null);
  assert.deepEqual(result.versionManifest, []);
  assert.ok(opts.logger.lines.some((l) => l.startsWith('info:') && l.includes('release-*')));
});

test('not a git repository disables versioning with a warning', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'eqty-docs-nogit-'));
  const log = logger();
  const result = extractVersions({
    root: dir,
    contentDirAbs: path.join(dir, 'src/content/docs'),
    cacheDir: path.join(dir, '.astro/eqty-docs'),
    tags: 'v*',
    granularity: 'major',
    logger: log,
  });
  assert.equal(result.currentVersion, null);
  assert.ok(log.lines.some((l) => l.startsWith('warn:') && /git/i.test(l)));
});

test('a shallow clone warns', () => {
  const f = fixture();
  const shallow = mkdtempSync(path.join(tmpdir(), 'eqty-docs-shallow-'));
  execFileSync('git', ['clone', '-q', '--depth', '1', `file://${f.repo}`, shallow]);
  const log = logger();
  extractVersions({
    root: path.join(shallow, 'packages/demo'),
    contentDirAbs: path.join(shallow, CONTENT),
    cacheDir: path.join(shallow, 'packages/demo/.astro/eqty-docs'),
    tags: 'v*',
    granularity: 'major',
    logger: log,
  });
  assert.ok(log.lines.some((l) => l.includes('fetch-depth')));
});

test('writes versions.json beside the cache for inspection', () => {
  const f = fixture();
  extractVersions(f.opts({ current: '4.0.0' }));
  const json = JSON.parse(
    readFileSync(path.join(f.root, '.astro/eqty-docs/versions.json'), 'utf8')
  );
  assert.equal(json.versionManifest[0].tag, 'v3.0.0');
});

/**
 * A repo whose content path is a file at v1.0.0 and a directory afterwards. `cat-file -e` passes on
 * a blob, so the tag is selected; `git archive` refuses it. That is the silent-empty shape.
 */
function blobFixture() {
  const repo = mkdtempSync(path.join(tmpdir(), 'eqty-docs-blob-'));
  sh(repo, 'init', '-q');
  sh(repo, 'config', 'user.email', 't@t');
  sh(repo, 'config', 'user.name', 't');

  const asFile = path.join(repo, CONTENT);
  mkdirSync(path.dirname(asFile), { recursive: true });
  writeFileSync(asFile, 'docs was a file here');
  sh(repo, 'add', '-A');
  sh(repo, 'commit', '-qm', 'v1');
  sh(repo, 'tag', 'v1.0.0');

  rmSync(asFile);
  const doc = path.join(repo, CONTENT, 'a.mdx');
  mkdirSync(path.dirname(doc), { recursive: true });
  writeFileSync(doc, '---\ntitle: A\n---\ntwo');
  sh(repo, 'add', '-A');
  sh(repo, 'commit', '-qm', 'v2');
  sh(repo, 'tag', 'v2.0.0');

  const root = path.join(repo, 'packages/demo');
  return {
    root,
    opts: {
      root,
      contentDirAbs: path.join(repo, CONTENT),
      cacheDir: path.join(root, '.astro/eqty-docs'),
      tags: 'v*',
      granularity: 'major' as const,
      current: '2.0.0',
      logger: logger(),
    },
  };
}

test('a version that extracts no files fails the build, naming the tag', () => {
  const f = blobFixture();
  assert.throws(() => extractVersions(f.opts), /v1\.0\.0/);
});

/** A v5.0.0 release with no content dir at its tag, and a folder holding its converted pages. */
function withFolder(f: ReturnType<typeof fixture>, version = '5.0.0') {
  sh(f.repo, 'tag', 'v5.0.0', 'v2.0.0');
  const dir = path.join(f.root, 'archive/v5');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'a.mdx'), '---\ntitle: A\n---\nfive');
  return { folders: { [version]: 'archive/v5' } };
}

test('a folder supplies the pages of a group whose tag has none', () => {
  const f = fixture();
  const { folders } = withFolder(f);
  const result = extractVersions(f.opts({ current: '6.0.0', folders }));
  const five = result.versionManifest.find((m) => m.id === 'v5');
  assert.equal(five?.tag, 'folder:5.0.0');
  assert.equal(
    readFileSync(path.join(f.root, '.astro/eqty-docs/versions/v5/a.mdx'), 'utf8'),
    '---\ntitle: A\n---\nfive'
  );
  // The release still redirects to its group's copy, as it would for a tag copy.
  assert.ok(result.versionRedirects.some((r) => r.id === 'v5.0.0' && r.to === 'v5'));
});

test('a missing folder fails the build naming it', () => {
  const f = fixture();
  sh(f.repo, 'tag', 'v5.0.0', 'v2.0.0');
  assert.throws(
    () => extractVersions(f.opts({ current: '6.0.0', folders: { '5.0.0': 'archive/none' } })),
    /archive\/none/
  );
});

test('a folder key that is not MAJOR.MINOR.PATCH fails', () => {
  const f = fixture();
  assert.throws(
    () => extractVersions(f.opts({ current: '4.0.0', folders: { '5.0': 'archive/v5' } })),
    /"5\.0" is not MAJOR\.MINOR\.PATCH/
  );
});

test('a folder replaces the pages of a tag that has them', () => {
  // The release job saves each release, with its wheel reports, as a folder; the tag's own
  // copy lacks them, so the folder must win.
  const f = fixture();
  mkdirSync(path.join(f.root, 'archive/v3'), { recursive: true });
  writeFileSync(path.join(f.root, 'archive/v3/a.mdx'), 'from the folder');
  const result = extractVersions(f.opts({ current: '4.0.0', folders: { '3.0.0': 'archive/v3' } }));
  assert.equal(result.versionManifest.find((m) => m.id === 'v3')?.tag, 'folder:3.0.0');
  assert.equal(
    readFileSync(path.join(f.root, '.astro/eqty-docs/versions/v3/a.mdx'), 'utf8'),
    'from the folder'
  );
});

test('a folder that is not the newest release of its group fails naming the newest', () => {
  const f = fixture();
  const { folders } = withFolder(f, '5.0.0');
  sh(f.repo, 'tag', 'v5.0.1', 'v2.0.0');
  assert.throws(
    () => extractVersions(f.opts({ current: '6.0.0', folders })),
    /5\.0\.0 is not the newest release of v5 \(v5\.0\.1 is\)/
  );
});

test('a folder for the current release waits until a newer release makes it old', () => {
  // The release job saves X.Y.Z as a folder right after releasing it, while X.Y is still current.
  const f = fixture();
  mkdirSync(path.join(f.root, 'archive/v4'), { recursive: true });
  writeFileSync(path.join(f.root, 'archive/v4/a.mdx'), 'saved');
  const opts = f.opts({ folders: { '4.0.0': 'archive/v4' } });
  const result = extractVersions(opts);
  assert.equal(
    result.versionManifest.find((m) => m.id === 'v4'),
    undefined
  );
  assert.ok(opts.logger.lines.some((l) => l.startsWith('info:') && l.includes('4.0.0')));
});

test('a folder older than current in the current group warns that it will fail', () => {
  // Normal for the minutes between a patch's tag and its archive PR; fatal if it lasts until the
  // next group ships, so the build says so now.
  const f = fixture();
  sh(f.repo, 'tag', 'v4.1.0');
  mkdirSync(path.join(f.root, 'archive/v4'), { recursive: true });
  writeFileSync(path.join(f.root, 'archive/v4/a.mdx'), 'saved');
  const opts = f.opts({ folders: { '4.0.0': 'archive/v4' } });
  const result = extractVersions(opts);
  assert.equal(result.currentVersion?.version, '4.1.0');
  assert.ok(
    opts.logger.lines.some(
      (l) => l.startsWith('warn:') && l.includes('4.0.0') && l.includes('4.1.0')
    )
  );
});

test('a missing folder for the current release fails the build naming it', () => {
  const f = fixture();
  assert.throws(
    () => extractVersions(f.opts({ folders: { '4.0.0': 'archive/none' } })),
    /archive\/none/
  );
});

test('folders listed while versioning is dormant say how to serve them', () => {
  const f = fixture();
  mkdirSync(path.join(f.root, 'archive/v4'), { recursive: true });
  writeFileSync(path.join(f.root, 'archive/v4/a.mdx'), 'four');
  const opts = f.opts({ tags: 'release-*', folders: { '4.0.0': 'archive/v4' } });
  extractVersions(opts);
  assert.ok(
    opts.logger.lines.some((l) => l.startsWith('warn:') && l.includes("current: 'folders'"))
  );
});

/** Pages for a release, as a release job would commit them. */
function folder(f: ReturnType<typeof fixture>, name: string, text = name) {
  const dir = path.join(f.root, 'archive', name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'a.mdx'), `---\ntitle: A\n---\n${text}`);
  return `archive/${name}`;
}

function dropTags(f: ReturnType<typeof fixture>) {
  for (const t of sh(f.repo, 'tag').split('\n').filter(Boolean)) sh(f.repo, 'tag', '-d', t);
}

test("current: 'folders' with no tags takes the highest folder and serves the rest", () => {
  const f = fixture();
  dropTags(f);
  const folders = { '3.0.0': folder(f, 'v3'), '4.0.0': folder(f, 'v4') };
  const opts = f.opts({ current: 'folders', folders });
  const result = extractVersions(opts);
  assert.equal(result.currentVersion?.version, '4.0.0');
  assert.deepEqual(
    result.versionManifest.map((m) => [m.id, m.tag]),
    [['v3', 'folder:3.0.0']]
  );
  assert.ok(opts.logger.lines.some((l) => l.includes('4.0.0 is the current release')));
});

test("current: 'folders' builds the same with the tags present", () => {
  const f = fixture();
  const folders = { '3.0.0': folder(f, 'v3'), '4.0.0': folder(f, 'v4') };
  const result = extractVersions(f.opts({ current: 'folders', folders }));
  assert.equal(result.currentVersion?.version, '4.0.0');
  assert.deepEqual(
    result.versionManifest.map((m) => [m.id, m.tag]),
    [['v3', 'folder:3.0.0']]
  );
});

test("current: 'folders' names a tag that has no folder yet", () => {
  const f = fixture();
  sh(f.repo, 'tag', 'v5.0.0');
  const folders = { '3.0.0': folder(f, 'v3'), '4.0.0': folder(f, 'v4') };
  const opts = f.opts({ current: 'folders', folders });
  const result = extractVersions(opts);
  assert.equal(result.currentVersion?.version, '4.0.0');
  assert.ok(
    opts.logger.lines.some(
      (l) => l.startsWith('warn:') && l.includes('v5.0.0') && l.includes('no folder yet')
    )
  );
});

test('tags ahead of the folders are named in one warning', () => {
  const f = fixture();
  sh(f.repo, 'tag', 'v5.0.0');
  sh(f.repo, 'tag', 'v6.0.0');
  const opts = f.opts({ current: 'folders', folders: { '4.0.0': folder(f, 'v4') } });
  extractVersions(opts);
  const warns = opts.logger.lines.filter((l) => l.includes('no folder yet'));
  assert.equal(warns.length, 1);
  assert.ok(warns[0]!.includes('v5.0.0') && warns[0]!.includes('v6.0.0'));
});

test("current: 'folders' with no folders is a config error", () => {
  const f = fixture();
  assert.throws(() => extractVersions(f.opts({ current: 'folders' })), /needs folders/);
});

test("current: 'folders' outside a git repository serves the folders", () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'eqty-docs-nogit-folders-'));
  for (const v of ['v3', 'v4']) {
    mkdirSync(path.join(dir, 'archive', v), { recursive: true });
    writeFileSync(path.join(dir, 'archive', v, 'a.mdx'), v);
  }
  const log = logger();
  const result = extractVersions({
    root: dir,
    contentDirAbs: path.join(dir, 'src/content/docs'),
    cacheDir: path.join(dir, '.astro/eqty-docs'),
    current: 'folders',
    tags: 'v*',
    granularity: 'major',
    folders: { '3.0.0': 'archive/v3', '4.0.0': 'archive/v4' },
    logger: log,
  });
  assert.equal(result.currentVersion?.version, '4.0.0');
  assert.deepEqual(
    result.versionManifest.map((m) => m.id),
    ['v3']
  );
  assert.ok(!log.lines.some((l) => l.includes('Versioning is off')));
});

test('a shallow clone with some tags builds the same as with none', () => {
  const f = fixture();
  const shallow = mkdtempSync(path.join(tmpdir(), 'eqty-docs-shallow-folders-'));
  execFileSync('git', ['clone', '-q', '--depth', '1', `file://${f.repo}`, shallow]);
  const root = path.join(shallow, 'packages/demo');
  for (const v of ['v3', 'v4']) {
    mkdirSync(path.join(root, 'archive', v), { recursive: true });
    writeFileSync(path.join(root, 'archive', v, 'a.mdx'), v);
  }
  const log = logger();
  const result = extractVersions({
    root,
    contentDirAbs: path.join(shallow, CONTENT),
    cacheDir: path.join(root, '.astro/eqty-docs'),
    current: 'folders',
    tags: 'v*',
    granularity: 'major',
    // 9.0.0 is above every tag the clone has; a shallow clone skips the typo check.
    folders: { '3.0.0': 'archive/v3', '9.0.0': 'archive/v4' },
    logger: log,
  });
  assert.equal(result.currentVersion?.version, '9.0.0');
  assert.ok(!log.lines.some((l) => l.includes('fetch-depth')));
});

test('a folder above every tag fails in a full clone, naming it', () => {
  const f = fixture();
  assert.throws(
    () => extractVersions(f.opts({ folders: { '5.0.0': folder(f, 'v5') } })),
    /folders 5\.0\.0 is above every release tag \(v4\.0\.0 is the highest\)/
  );
});

test('with no tags, a high folder is not a typo', () => {
  const f = fixture();
  dropTags(f);
  const result = extractVersions(
    f.opts({ current: 'folders', folders: { '5.0.0': folder(f, 'v5') } })
  );
  assert.equal(result.currentVersion?.version, '5.0.0');
});

test('non-release tags alone never trigger the typo check', () => {
  const f = fixture();
  dropTags(f);
  sh(f.repo, 'tag', 'v-nightly');
  sh(f.repo, 'tag', 'v2.3.1-rc1');
  const result = extractVersions(
    f.opts({ current: 'folders', folders: { '4.0.0': folder(f, 'v4') } })
  );
  assert.equal(result.currentVersion?.version, '4.0.0');
});

test('a missing folder fails even when versioning would be dormant', () => {
  const f = fixture();
  assert.throws(
    () => extractVersions(f.opts({ tags: 'release-*', folders: { '4.0.0': 'archive/none' } })),
    /archive\/none/
  );
});

test("current: 'folders' works at granularity patch and major", () => {
  for (const granularity of ['patch', 'major'] as const) {
    const f = fixture();
    dropTags(f);
    const folders = { '3.0.0': folder(f, 'v3'), '4.0.0': folder(f, 'v4') };
    const result = extractVersions(f.opts({ current: 'folders', granularity, folders }));
    const id = granularity === 'patch' ? 'v3.0.0' : 'v3';
    assert.deepEqual(
      result.versionManifest.map((m) => m.id),
      [id]
    );
    // Coarser groupings resolve too: `/v3/` works at patch.
    assert.ok(result.versionRedirects.some((r) => r.id === 'v3' || id === 'v3'));
  }
});

test('the tags-above warning prints versions, not the internal folder: prefix', () => {
  const f = fixture();
  const opts = f.opts({ current: '3.0.0', folders: { '4.0.0': folder(f, 'v4') } });
  // A folder above an explicit current then fails the newest-in-group check; the warning comes first.
  assert.throws(() => extractVersions(opts), /4\.0\.0 is not the newest release of v4/);
  const above = opts.logger.lines.find((l) => l.includes('ignored'));
  assert.ok(above && above.includes('4.0.0') && !above.includes('folder:'));
});
