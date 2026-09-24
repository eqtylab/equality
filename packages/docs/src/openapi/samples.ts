import { snippetz } from '@scalar/snippetz';

import type { CodeSample, Operation, SchemaNode } from './types.ts';

const PLACEHOLDER_SERVER = 'https://example.com';

function exampleFor(schema: SchemaNode | undefined, depth = 0): unknown {
  if (!schema || schema.recursive || depth > 4) return undefined;
  if (schema.example !== undefined) return schema.example;
  if (schema.enum?.length) return schema.enum[0];
  if (schema.properties) {
    return Object.fromEntries(
      schema.properties.map((p) => [p.name, exampleFor(p.schema, depth + 1) ?? null])
    );
  }
  if (schema.type === 'array')
    return [exampleFor(schema.items, depth + 1)].filter((v) => v !== undefined);
  return { string: 'string', integer: 0, number: 0, boolean: true }[schema.type ?? ''] ?? undefined;
}

export function samplesFor(op: Operation, servers: string[]): CodeSample[] {
  const url = `${(servers[0] ?? PLACEHOLDER_SERVER).replace(/\/$/, '')}${op.path}`;
  const json = op.requestBody?.content.find((c) => c.mediaType.includes('json'));
  const body = json ? (json.example ?? exampleFor(json.schema)) : undefined;
  const request = {
    method: op.method.toUpperCase(),
    url,
    headers: json ? [{ name: 'Content-Type', value: json.mediaType }] : [],
    queryString: op.parameters
      .filter((p) => p.in === 'query' && p.required)
      .map((p) => ({ name: p.name, value: `{${p.name}}` })),
    ...(body !== undefined
      ? { postData: { mimeType: json!.mediaType, text: JSON.stringify(body) } }
      : {}),
  };
  const printer = snippetz();
  const curl = printer.print('shell', 'curl', request) ?? '';
  // The curl plugin single-quotes any URL outside its shell-safe charset, which excludes `{`/`}`.
  // Bare `{keyId}` isn't bash brace expansion (no comma or range), so it's safe unquoted — and it
  // must read as a placeholder, not a quoted literal.
  const curlCode = url.includes('{') ? curl.replace(`'${url}'`, url) : curl;
  return [
    { label: 'cURL', lang: 'bash', code: curlCode },
    { label: 'fetch', lang: 'js', code: printer.print('js', 'fetch', request) ?? '' },
  ];
}
