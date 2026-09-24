import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { ingest, OpenApiError } from '../src/openapi/ingest.ts';

const FIXTURES = new URL('./fixtures/openapi/', import.meta.url);
const read = (name: string) => readFileSync(new URL(name, FIXTURES), 'utf8');

const operations = (doc: { paths: Record<string, Record<string, unknown>> }) =>
  Object.values(doc.paths).flatMap((item) =>
    ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].filter((m) => item[m])
  ).length;

test('Swagger 2.0 YAML is upgraded to OpenAPI 3 and dereferenced', async () => {
  const doc = await ingest(read('auth-service.swagger.yaml'), 'auth-service.swagger.yaml');
  assert.match(doc.openapi, /^3\.0\./);
  assert.equal(operations(doc), 53);
  assert.equal(JSON.stringify(doc).includes('"$ref"'), false);
});

test('each real file yields its operation count', async () => {
  for (const [file, count] of [
    ['governance-service.swagger.yaml', 57],
    ['integrity-service.openapi.json', 35],
  ] as const) {
    assert.equal(operations(await ingest(read(file), file)), count, file);
  }
});

test('an OpenAPI 3 file keeps its version', async () => {
  const doc = await ingest(
    read('integrity-service.openapi.json'),
    'integrity-service.openapi.json'
  );
  assert.equal(doc.openapi, '3.0.3');
});

test('an unquoted swagger: 2.0 is upgraded to OpenAPI 3', async () => {
  const doc = await ingest(read('unquoted-swagger.yaml'), 'unquoted-swagger.yaml');
  assert.match(doc.openapi, /^3\./);
  assert.ok(doc.paths['/a'].get);
});

async function rejects(name: string, pattern: RegExp) {
  await assert.rejects(ingest(read(`bad/${name}`), `bad/${name}`), (err: unknown) => {
    assert.ok(err instanceof OpenApiError, 'is an OpenApiError');
    assert.equal(err.file, `bad/${name}`);
    assert.match(err.message, pattern);
    assert.match(err.message, /^\[@eqtylab\/docs\]/);
    return true;
  });
}

test('unparseable YAML fails naming the file, line and column', () =>
  rejects('not-yaml.yaml', /bad\/not-yaml\.yaml.*line \d+, column \d+/s));

test('an unknown version fails naming the value found', () =>
  rejects('wrong-version.json', /bad\/wrong-version\.json.*"4\.0\.0"/s));

test('unparseable JSON fails naming the file, line and column', () =>
  rejects('not-json.json', /bad\/not-json\.json.*line \d+, column \d+/s));

test('a missing $ref target fails naming the ref', () =>
  rejects('missing-ref.json', /#\/components\/responses\/Missing/));
