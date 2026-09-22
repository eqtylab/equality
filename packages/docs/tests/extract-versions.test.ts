import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
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
