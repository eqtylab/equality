import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { createExpander, type ExpandContext } from '../src/openapi/expand.ts';
import { modelId, operationEntryId } from '../src/openapi/fan-out.ts';
import { loadOpenApi } from '../src/openapi/index.ts';

const FIXTURES = new URL('./fixtures/openapi/', import.meta.url);
const cyclic = readFileSync(new URL('cyclic.openapi.json', FIXTURES), 'utf8');

const ROOT = '/proj';
const CONTENT = '/proj/src/content/docs';
const OWNER = 'ref/api';

function harness(
  files: Record<string, string>,
  ownerData: Record<string, unknown> = { title: 'API', openapi: './_api.json' },
  readFile?: ExpandContext['readFile']
) {
  const store = new Map<
    string,
    { id: string; data: Record<string, unknown>; body?: string; filePath?: string }
  >();
  store.set(OWNER, { id: OWNER, data: ownerData, filePath: 'src/content/docs/ref/api.mdx' });
  const log = { warn: [] as string[], error: [] as string[] };
  let reads = 0;
  const ctx: ExpandContext = {
    store: {
      get: (id) => store.get(id),
      set: (e) => void store.set(e.id, e),
      delete: (id) => void store.delete(id),
      keys: () => store.keys(),
    },
    parseData: async ({ data }) => data,
    generateDigest: (t) => String(t.length) + t.slice(0, 32),
    readFile:
      readFile ??
      (async (abs) => {
        reads++;
        if (!(abs in files)) throw Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
        return files[abs]!;
      }),
    logger: { warn: (m) => log.warn.push(m), error: (m) => log.error.push(m) },
  };
  let loads = 0;
  const load: typeof loadOpenApi = (...args) => {
    loads++;
    return loadOpenApi(...args);
  };
  const expander = createExpander(
    { projectRoot: ROOT, contentRoot: CONTENT, cache: new Map(), load },
    ctx
  );
  return { store, log, expander, reads: () => reads, loads: () => loads, files };
}

test('expand writes the model and one entry per operation', async () => {
  const h = harness({ '/proj/src/content/docs/ref/_api.json': cyclic });
  await h.expander.expand(OWNER, true);
  assert.ok(h.store.has(modelId(OWNER)));
  assert.ok(h.store.has(operationEntryId(OWNER, 'nodesid')));
});

test('a missing file is fatal in a build and names the page and the path', async () => {
  const h = harness({});
  await assert.rejects(
    h.expander.expand(OWNER, true),
    /src\/content\/docs\/ref\/api\.mdx.*_api\.json.*does not exist/s
  );
});

test('a missing file in dev logs an error and leaves no stale pages', async () => {
  const h = harness({ '/proj/src/content/docs/ref/_api.json': cyclic });
  await h.expander.expand(OWNER, true);
  delete h.files['/proj/src/content/docs/ref/_api.json'];
  await h.expander.expand(OWNER, false);
  assert.equal(h.log.error.length, 1);
  assert.deepEqual([...h.store.keys()], [OWNER]);
});

test('a file outside the content directory fails, because versions would not freeze it', async () => {
  const h = harness(
    { '/proj/public/api.json': cyclic },
    { title: 'API', openapi: '../../../../public/api.json' }
  );
  await assert.rejects(h.expander.expand(OWNER, true), /outside the content directory/);
});

test('re-expanding after an operation is removed deletes its page', async () => {
  const two = JSON.parse(cyclic);
  two.paths['/extra'] = { get: { summary: 'Extra', responses: { 200: { description: 'ok' } } } };
  const h = harness({ '/proj/src/content/docs/ref/_api.json': JSON.stringify(two) });
  await h.expander.expand(OWNER, true);
  assert.ok(h.store.has(operationEntryId(OWNER, 'extra')));
  h.files['/proj/src/content/docs/ref/_api.json'] = cyclic;
  await h.expander.expand(OWNER, false);
  assert.equal(h.store.has(operationEntryId(OWNER, 'extra')), false);
});

test('an unchanged file is parsed once across expands, but its entries are re-set', async () => {
  const h = harness({ '/proj/src/content/docs/ref/_api.json': cyclic });
  await h.expander.expand(OWNER, true);
  h.store.delete(operationEntryId(OWNER, 'nodesid'));
  await h.expander.expand(OWNER, true);
  assert.ok(h.store.has(operationEntryId(OWNER, 'nodesid')));
  assert.equal(h.loads(), 1);
});

test('two overlapping expands for one owner run in order, so the later file wins', async () => {
  const two = JSON.parse(cyclic);
  two.paths['/extra'] = { get: { summary: 'Extra', responses: { 200: { description: 'ok' } } } };
  const replies = [
    { text: JSON.stringify(two), delay: 20 },
    { text: cyclic, delay: 0 },
  ];
  const h = harness({}, undefined, async () => {
    const { text, delay } = replies.shift()!;
    await new Promise((r) => setTimeout(r, delay));
    return text;
  });
  await Promise.all([h.expander.expand(OWNER, false), h.expander.expand(OWNER, false)]);
  const ops = [...h.store.keys()].filter((k) => k.startsWith(`${OWNER}/operations/`));
  assert.deepEqual(ops, [operationEntryId(OWNER, 'nodesid')]);
});

test('an authored page under the operations path survives a re-expand', async () => {
  const h = harness({ '/proj/src/content/docs/ref/_api.json': cyclic });
  const authored = operationEntryId(OWNER, 'custom-notes');
  h.store.set(authored, {
    id: authored,
    data: { title: 'Notes' },
    filePath: 'src/content/docs/ref/api/operations/custom-notes.mdx',
  });
  await h.expander.expand(OWNER, true);
  await h.expander.expand(OWNER, false);
  assert.ok(h.store.has(authored));
});

test('an authored page at a generated operation URL fails the build naming the page', async () => {
  const h = harness({ '/proj/src/content/docs/ref/_api.json': cyclic });
  const clash = operationEntryId(OWNER, 'nodesid');
  const filePath = 'src/content/docs/ref/api/operations/nodesid.mdx';
  h.store.set(clash, { id: clash, data: { title: 'Mine' }, filePath });
  await assert.rejects(
    h.expander.expand(OWNER, true),
    /ref\/api\/operations\/nodesid\.mdx.*same URL as operation nodesid/s
  );
  await h.expander.expand(OWNER, false);
  assert.equal(h.store.get(clash)?.filePath, filePath);
  assert.equal(h.log.error.length, 1);
});

test('a file that no longer parses in dev removes the model with the operations', async () => {
  const h = harness({ '/proj/src/content/docs/ref/_api.json': cyclic });
  await h.expander.expand(OWNER, true);
  h.files['/proj/src/content/docs/ref/_api.json'] = '{ "openapi": ';
  await h.expander.expand(OWNER, false);
  assert.equal(h.log.error.length, 1);
  assert.equal(h.store.has(modelId(OWNER)), false);
  assert.deepEqual([...h.store.keys()], [OWNER]);
});

test('ownerOf maps a watched file back to its page', async () => {
  const h = harness({ '/proj/src/content/docs/ref/_api.json': cyclic });
  await h.expander.expand(OWNER, true);
  assert.equal(h.expander.ownerOf('/proj/src/content/docs/ref/_api.json'), OWNER);
});

test("ownerOf maps the page's own MDX file, so a frontmatter edit re-expands", async () => {
  const h = harness({ '/proj/src/content/docs/ref/_api.json': cyclic });
  await h.expander.expand(OWNER, true);
  assert.equal(h.expander.ownerOf('/proj/src/content/docs/ref/api.mdx'), OWNER);
});
