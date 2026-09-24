import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { loadOpenApi, markdownFor } from '../src/openapi/index.ts';

const FIXTURES = new URL('./fixtures/openapi/', import.meta.url);
const load = (file: string) => loadOpenApi(readFileSync(new URL(file, FIXTURES), 'utf8'), file);

test('each operation carries a cURL and a fetch sample, in that order', async () => {
  const m = await load('auth-service.swagger.yaml');
  for (const op of m.operations)
    assert.deepEqual(
      op.samples.map((s) => s.label),
      ['cURL', 'fetch']
    );
});

test('the cURL sample uses the first server, the method and the path with parameters as placeholders', async () => {
  const m = await load('auth-service.swagger.yaml');
  const op = m.operations.find((o) => o.slug === 'apiv1api-keyskeyid/delete')!;
  const curl = op.samples[0]!.code;
  assert.match(curl, /^curl http:\/\/localhost:8080\/api\/v1\/api-keys\/\{keyId\}/);
  assert.match(curl, /--request DELETE/);
});

test('with no server, samples use https://example.com', async () => {
  const m = await load('integrity-service.openapi.json');
  assert.match(m.operations[0]!.samples[0]!.code, /https:\/\/example\.com\//);
});

test('a JSON body is sent with a content type and example data', async () => {
  const m = await load('auth-service.swagger.yaml');
  const post = m.operations.find((o) => o.slug === 'apiv1api-keys/post')!;
  assert.match(post.samples[0]!.code, /--header 'Content-Type: application\/json'/);
  assert.match(post.samples[0]!.code, /--data/);
});

test('the twin opens with method and path, and lists parameters and responses', async () => {
  const m = await load('auth-service.swagger.yaml');
  const op = m.operations.find((o) => o.slug === 'apiv1api-keyskeyid/delete')!;
  const md = markdownFor(op, m);
  assert.match(md, /^`DELETE \/api\/v1\/api-keys\/\{keyId\}`/);
  assert.match(md, /## Parameters/);
  assert.match(md, /\| `keyId` \| path \|/);
  assert.match(md, /## Responses/);
  assert.match(md, /```bash\ncurl /);
});
