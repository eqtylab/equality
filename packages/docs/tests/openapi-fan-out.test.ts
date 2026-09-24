import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { assertNotForged, fanOut, modelId, operationEntryId } from '../src/openapi/fan-out.ts';
import { loadOpenApi } from '../src/openapi/index.ts';

const FIXTURES = new URL('./fixtures/openapi/', import.meta.url);
const owner = { id: 'reference/auth-service/api-reference', title: 'Auth Service API' };
const source = { path: '/abs/_auth.openapi.yaml', ext: 'yaml' as const };

async function entries(o: Parameters<typeof fanOut>[0] = owner) {
  const text = readFileSync(new URL('auth-service.swagger.yaml', FIXTURES), 'utf8');
  return fanOut(o, await loadOpenApi(text, 'auth-service.swagger.yaml'), source);
}

test('one model entry plus one entry per operation', async () => {
  const list = await entries();
  assert.equal(list.length, 1 + 53);
  assert.equal(list[0]!.id, modelId(owner.id));
  assert.equal(list[0]!.data.generated, 'model');
  assert.equal(list[0]!.data.hidden, true);
  assert.equal(list[0]!.data.noIndex, true);
  assert.deepEqual(list[0]!.data.source, source);
});

test('operation ids nest under the owner, and carry the twin body', async () => {
  const op = (await entries()).find(
    (e) => e.id === operationEntryId(owner.id, 'apiv1api-keys/get')
  )!;
  assert.equal(op.data.generated, 'operation');
  assert.equal(op.data.owner, owner.id);
  assert.match(op.body!, /^`GET \/api\/v1\/api-keys`/);
});

test("the owner's draft, hidden and noIndex carry to every operation", async () => {
  const ops = (await entries({ ...owner, draft: true, hidden: true, noIndex: true })).slice(1);
  assert.ok(
    ops.every((e) => e.data.draft === true && e.data.hidden === true && e.data.noIndex === true)
  );
});

test('an ordinary owner leaves operations visible', async () => {
  const ops = (await entries()).slice(1);
  assert.ok(ops.every((e) => !e.data.draft && !e.data.hidden && !e.data.noIndex));
});

test('an authored page carrying a generated field fails the build naming the file', () => {
  assert.throws(
    () =>
      assertNotForged({
        id: 'x',
        filePath: 'src/content/docs/x.mdx',
        data: { title: 'x', generated: 'operation' },
      }),
    /src\/content\/docs\/x\.mdx.*generated/s
  );
  assert.doesNotThrow(() =>
    assertNotForged({ id: 'x/~api', data: { title: 'x', generated: 'model' } })
  );
});
