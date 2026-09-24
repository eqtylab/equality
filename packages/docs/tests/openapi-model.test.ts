import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { ingest, OpenApiError } from '../src/openapi/ingest.ts';
import { buildModel } from '../src/openapi/model.ts';
import type { ApiModel, SchemaNode } from '../src/openapi/types.ts';

const FIXTURES = new URL('./fixtures/openapi/', import.meta.url);
const read = (name: string) => readFileSync(new URL(name, FIXTURES), 'utf8');

async function model(file: string, warnings: string[] = []): Promise<ApiModel> {
  return buildModel(await ingest(read(file), file), file, (m) => warnings.push(m));
}

// Walks a finite SchemaNode tree; safe because a genuine cycle stops at a `recursive` marker.
function walkSchema(node: SchemaNode | undefined, visit: (n: SchemaNode) => void): void {
  if (!node) return;
  visit(node);
  for (const p of node.properties ?? []) walkSchema(p.schema, visit);
  walkSchema(node.items, visit);
  for (const s of node.oneOf ?? []) walkSchema(s, visit);
  for (const s of node.anyOf ?? []) walkSchema(s, visit);
  for (const s of node.allOf ?? []) walkSchema(s, visit);
  if (typeof node.additionalProperties === 'object') walkSchema(node.additionalProperties, visit);
}

function schemasIn(m: ApiModel): SchemaNode[] {
  const all: SchemaNode[] = [];
  const visit = (n: SchemaNode) => all.push(n);
  for (const op of m.operations) {
    for (const p of op.parameters) walkSchema(p.schema, visit);
    for (const c of op.requestBody?.content ?? []) walkSchema(c.schema, visit);
    for (const r of op.responses) for (const c of r.content) walkSchema(c.schema, visit);
  }
  return all;
}

const SERVICES = {
  'auth-service': 'auth-service.swagger.yaml',
  'governance-service': 'governance-service.swagger.yaml',
  'integrity-service': 'integrity-service.openapi.json',
} as const;

test('every live operation URL is produced, exactly', async () => {
  const live = read('live-urls.txt')
    .split('\n')
    .filter((u) => u && !u.includes('/operations/tags/'));
  const ours = new Set<string>();
  for (const [service, file] of Object.entries(SERVICES)) {
    const base = `/reference/${service}/api-reference/`;
    ours.add(base);
    for (const op of (await model(file)).operations) ours.add(`${base}operations/${op.slug}/`);
  }
  assert.deepEqual(
    live.filter((u) => !ours.has(u)),
    []
  );
  assert.equal(live.length, 146);
});

test('every live tag URL maps to a tag slug of its service', async () => {
  const tagUrls = read('live-urls.txt')
    .split('\n')
    .filter((u) => u.includes('/operations/tags/'));
  for (const url of tagUrls) {
    const [, service, tag] =
      /^\/reference\/([^/]+)\/api-reference\/operations\/tags\/([^/]+)\/$/.exec(url)!;
    const slugs = (await model(SERVICES[service as keyof typeof SERVICES])).tags.map((t) => t.slug);
    assert.ok(slugs.includes(tag!), `${url} has no tag`);
  }
});

test('operation counts per service', async () => {
  assert.equal((await model(SERVICES['auth-service'])).operations.length, 53);
  assert.equal((await model(SERVICES['governance-service'])).operations.length, 57);
  assert.equal((await model(SERVICES['integrity-service'])).operations.length, 35);
});

test('a shared path key gets the method appended; a unique one does not', async () => {
  const slugs = (await model(SERVICES['auth-service'])).operations.map((o) => o.slug);
  assert.ok(slugs.includes('apiv1api-keys/get'));
  assert.ok(slugs.includes('apiv1api-keys/post'));
  assert.ok(slugs.includes('apiv1authwell-knownjwksjson'));
});

test('an operationId is slugged, not replaced', async () => {
  const ops = (await model(SERVICES['integrity-service'])).operations;
  assert.ok(ops.some((o) => o.id === 'find_cid' && o.slug === 'find_cid'));
});

test('two methods on one path, one with an operationId, both stay unsuffixed', async () => {
  const doc = await ingest(
    JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'x', version: '1' },
      paths: {
        '/things': {
          get: { operationId: 'listThings', responses: { 200: { description: 'ok' } } },
          post: { responses: { 201: { description: 'made' } } },
        },
      },
    }),
    'mixed.json'
  );
  assert.deepEqual(
    buildModel(doc, 'mixed.json').operations.map((o) => o.slug),
    ['listthings', 'things']
  );
});

test('Swagger tags follow first-seen order; OpenAPI tags follow the tags array', async () => {
  assert.equal((await model(SERVICES['auth-service'])).tags[0]!.name, 'API Keys');
  const file = SERVICES['integrity-service'];
  const doc = await ingest(read(file), file);
  const integrity = buildModel(doc, file);
  const used = new Set(integrity.operations.map((o) => o.tag));
  const declared = (doc.tags ?? []).map((t) => t.name).filter((n) => used.has(n));
  assert.deepEqual(integrity.tags.map((t) => t.name).slice(0, declared.length), declared);
  assert.ok(
    integrity.tags.every((t) => used.has(t.name)),
    'no empty tags'
  );
});

test('security requirements resolve against declared schemes', async () => {
  const m = await model(SERVICES['auth-service']);
  assert.deepEqual(Object.keys(m.securitySchemes).sort(), ['ApiKeyAuth', 'BearerAuth']);
  const secured = m.operations.find((o) => o.security.length > 0)!;
  for (const alternative of secured.security) {
    for (const { scheme } of alternative) assert.ok(m.securitySchemes[scheme], scheme);
  }
});

test('Swagger host becomes a server; no server means none', async () => {
  assert.deepEqual((await model(SERVICES['auth-service'])).servers, ['http://localhost:8080/']);
  assert.deepEqual((await model(SERVICES['integrity-service'])).servers, []);
});

test('a circular $ref renders one level, then a marker, and the model serialises', async () => {
  const m = await model('cyclic.openapi.json');
  const schema = m.operations[0]!.responses[0]!.content[0]!.schema!;
  const child = schema.properties!.find((p) => p.name === 'child')!.schema;
  assert.equal(child.recursive, true);
  assert.doesNotThrow(() => JSON.stringify(m));
});

test('a schema reused without a cycle is never marked recursive', async () => {
  const doc = await ingest(
    JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'x', version: '1' },
      paths: {
        '/things': {
          get: {
            responses: {
              200: {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        a: { $ref: '#/components/schemas/Shared' },
                        b: { $ref: '#/components/schemas/Shared' },
                        list: { type: 'array', items: { $ref: '#/components/schemas/Shared' } },
                        map: {
                          type: 'object',
                          additionalProperties: { $ref: '#/components/schemas/Shared' },
                        },
                        plain: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: { Shared: { type: 'object', properties: { name: { type: 'string' } } } },
      },
    }),
    'reuse.json'
  );
  const inlineNodes = schemasIn(buildModel(doc, 'reuse.json'));
  assert.ok(inlineNodes.length > 0);
  assert.ok(
    inlineNodes.every((n) => !n.recursive),
    'inline doc: no node should be marked recursive'
  );

  const authNodes = schemasIn(await model(SERVICES['auth-service']));
  assert.ok(authNodes.length > 0);
  assert.ok(
    authNodes.every((n) => !n.recursive),
    'auth-service: no false recursion markers'
  );
});

test('two operations with one slug fail listing both', async () => {
  const doc = await ingest(read('bad/duplicate-slug.json'), 'bad/duplicate-slug.json');
  assert.throws(
    () => buildModel(doc, 'bad/duplicate-slug.json'),
    (err: unknown) => {
      assert.ok(err instanceof OpenApiError);
      assert.match(err.message, /GET \/ab/);
      assert.match(err.message, /GET \/a\/b/);
      return true;
    }
  );
});

test('two tags with one slug fail listing both', async () => {
  const doc = await ingest(read('bad/tag-collision.json'), 'bad/tag-collision.json');
  assert.throws(() => buildModel(doc, 'bad/tag-collision.json'), /"API Keys".*"api-keys"/s);
});

test('an untitled operation is titled METHOD /path and warns once', async () => {
  const warnings: string[] = [];
  const m = await model('bad/untitled.json', warnings);
  assert.equal(m.operations[0]!.title, 'DELETE /a');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0]!, /bad\/untitled\.json.*DELETE \/a/);
});

test('an operation without tags goes under Operations', async () => {
  const m = await model('bad/untitled.json');
  assert.equal(m.operations[0]!.tag, 'Operations');
  assert.equal(m.operations[0]!.tagSlug, 'operations');
});
