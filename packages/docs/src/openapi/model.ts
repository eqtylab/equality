import { slug } from 'github-slugger';

import { OpenApiError } from './ingest.ts';
import { toSchemaNode } from './schema-tree.ts';
import {
  HTTP_METHODS,
  type ApiModel,
  type HttpMethod,
  type MediaBody,
  type OpenApiDocument,
  type Operation,
  type Parameter,
  type Response,
  type SecurityRequirement,
  type SecurityScheme,
} from './types.ts';

// Dereferenced OpenAPI input is untyped by nature; the model's own types start at buildModel's return.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>;

const DEFAULT_TAG = 'Operations';

function content(raw: Raw | undefined) {
  return Object.entries(raw ?? {}).map(([mediaType, media]: [string, Raw]) => ({
    mediaType,
    schema: toSchemaNode(media.schema),
    example: media.example ?? firstExample(media.examples),
  }));
}

function firstExample(examples: Raw | undefined) {
  const first = examples && Object.values(examples)[0];
  return first && typeof first === 'object' && 'value' in first ? first.value : undefined;
}

function parameters(pathItem: Raw, op: Raw): Parameter[] {
  const byKey = new Map<string, Raw>();
  for (const p of [...(pathItem.parameters ?? []), ...(op.parameters ?? [])] as Raw[])
    byKey.set(`${p.in}:${p.name}`, p);
  return [...byKey.values()].map((p) => ({
    name: p.name,
    in: p.in,
    required: p.in === 'path' ? true : Boolean(p.required),
    description: p.description,
    deprecated: Boolean(p.deprecated),
    schema: toSchemaNode(p.schema),
    example: p.example,
  }));
}

function requestBody(op: Raw): MediaBody | undefined {
  if (!op.requestBody) return undefined;
  return {
    description: op.requestBody.description,
    required: Boolean(op.requestBody.required),
    content: content(op.requestBody.content),
  };
}

function responses(op: Raw): Response[] {
  return Object.entries((op.responses ?? {}) as Raw).map(([status, r]: [string, Raw]) => ({
    status,
    description: r.description ?? '',
    content: content(r.content),
  }));
}

function security(list: Raw[] | undefined): SecurityRequirement[] {
  return (list ?? []).map((alternative) =>
    Object.entries(alternative).map(([scheme, scopes]) => ({
      scheme,
      scopes: (scopes as string[]) ?? [],
    }))
  );
}

function schemes(doc: OpenApiDocument): Record<string, SecurityScheme> {
  const out: Record<string, SecurityScheme> = {};
  for (const [name, s] of Object.entries((doc.components?.securitySchemes ?? {}) as Raw)) {
    out[name] = {
      name,
      type: s.type,
      description: s.description,
      scheme: s.scheme,
      bearerFormat: s.bearerFormat,
      in: s.in,
      paramName: s.name,
    };
  }
  return out;
}

export function buildModel(
  doc: OpenApiDocument,
  file: string,
  onWarn?: (message: string) => void
): ApiModel {
  const operations: Operation[] = [];

  for (const [path, pathItem] of Object.entries(doc.paths ?? {}) as Array<[string, Raw]>) {
    const methods = HTTP_METHODS.filter((m) => pathItem[m]);
    const keys = methods.map((m) => (pathItem[m].operationId as string | undefined) ?? path);

    methods.forEach((method: HttpMethod, i) => {
      const op = pathItem[method] as Raw;
      const key = keys[i]!;
      const shared = keys.filter((k) => k === key).length > 1;
      const tag = (op.tags?.[0] as string | undefined) ?? DEFAULT_TAG;
      const fallback = `${method.toUpperCase()} ${path}`;
      const title = op.summary ?? op.operationId ?? fallback;
      if (title === fallback && !op.description) {
        onWarn?.(
          `[@eqtylab/docs] ${file}: ${fallback} has no summary, operationId or description. Its page is titled "${fallback}".`
        );
      }
      operations.push({
        id: op.operationId,
        slug: shared ? `${slug(key)}/${slug(method)}` : slug(key),
        method,
        path,
        tag,
        tagSlug: slug(tag),
        title,
        description: op.description,
        deprecated: Boolean(op.deprecated),
        parameters: parameters(pathItem, op),
        requestBody: requestBody(op),
        responses: responses(op),
        security: security(op.security ?? doc.security),
        samples: [],
      });
    });
  }

  const bySlug = new Map<string, Operation[]>();
  for (const op of operations) bySlug.set(op.slug, [...(bySlug.get(op.slug) ?? []), op]);
  const clashes = [...bySlug.values()].filter((list) => list.length > 1);
  if (clashes.length) {
    const lines = clashes
      .map((list) => list.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(' and '))
      .join('; ');
    throw new OpenApiError(
      file,
      `operations share a URL: ${lines}.`,
      'Give one of them an operationId.'
    );
  }

  const declared = new Map((doc.tags ?? []).map((t, i) => [t.name, { i, t }]));
  const seen = [...new Set(operations.map((o) => o.tag))];
  const ordered = seen
    .map((name, firstSeen) => ({
      name,
      rank: declared.get(name)?.i ?? Number.POSITIVE_INFINITY,
      firstSeen,
    }))
    .sort((a, b) => a.rank - b.rank || a.firstSeen - b.firstSeen);

  const tagSlugs = new Map<string, string[]>();
  for (const { name } of ordered)
    tagSlugs.set(slug(name), [...(tagSlugs.get(slug(name)) ?? []), name]);
  const tagClash = [...tagSlugs.values()].find((names) => names.length > 1);
  if (tagClash) {
    throw new OpenApiError(
      file,
      `tags ${tagClash.map((n) => `"${n}"`).join(' and ')} share one URL.`,
      'Rename one of the tags.'
    );
  }

  return {
    info: { title: doc.info.title, version: doc.info.version, description: doc.info.description },
    servers: (doc.servers ?? []).map((s) => s.url),
    securitySchemes: schemes(doc),
    tags: ordered.map(({ name }) => ({
      name,
      slug: slug(name),
      description: declared.get(name)?.t.description,
    })),
    operations,
  };
}
