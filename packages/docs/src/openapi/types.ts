/** The viewer's model. Pages render from these types, never from raw OpenAPI. Keep free of `astro:*`. */

export type HttpMethod = 'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace';

export const HTTP_METHODS: readonly HttpMethod[] = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
];

/** Badge colour per method, shared by the sidebar and the page so the two cannot disagree. */
export const METHOD_VARIANT: Record<
  HttpMethod,
  'primary' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  get: 'primary',
  post: 'success',
  put: 'warning',
  patch: 'warning',
  delete: 'danger',
  head: 'neutral',
  options: 'neutral',
  trace: 'neutral',
};

export interface OpenApiDocument {
  openapi: string;
  info: { title: string; version: string; description?: string };
  servers?: Array<{ url: string; description?: string }>;
  tags?: Array<{ name: string; description?: string }>;
  paths: Record<string, Record<string, unknown>>;
  components?: { securitySchemes?: Record<string, Record<string, unknown>> };
  security?: Array<Record<string, string[]>>;
}

/** A finite schema tree. `recursive` marks where a `$ref` re-entered an ancestor. */
export interface SchemaNode {
  type?: string;
  format?: string;
  description?: string;
  enum?: unknown[];
  example?: unknown;
  default?: unknown;
  nullable?: boolean;
  deprecated?: boolean;
  required?: boolean;
  properties?: Array<{ name: string; schema: SchemaNode }>;
  items?: SchemaNode;
  oneOf?: SchemaNode[];
  anyOf?: SchemaNode[];
  allOf?: SchemaNode[];
  additionalProperties?: SchemaNode | boolean;
  recursive?: true;
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  description?: string;
  deprecated: boolean;
  schema?: SchemaNode;
  example?: unknown;
}

export interface MediaBody {
  description?: string;
  required: boolean;
  content: Array<{ mediaType: string; schema?: SchemaNode; example?: unknown }>;
}

export interface Response {
  status: string;
  description: string;
  content: Array<{ mediaType: string; schema?: SchemaNode; example?: unknown }>;
}

export interface SecurityScheme {
  name: string;
  type: string;
  description?: string;
  scheme?: string;
  bearerFormat?: string;
  in?: string;
  paramName?: string;
}

/** One alternative in an operation's `security` list: every scheme named must be satisfied. */
export type SecurityRequirement = Array<{ scheme: string; scopes: string[] }>;

export interface CodeSample {
  label: 'cURL' | 'fetch';
  lang: 'bash' | 'js';
  code: string;
}

export interface Operation {
  id?: string;
  slug: string;
  method: HttpMethod;
  path: string;
  tag: string;
  tagSlug: string;
  title: string;
  description?: string;
  deprecated: boolean;
  parameters: Parameter[];
  requestBody?: MediaBody;
  responses: Response[];
  security: SecurityRequirement[];
  samples: CodeSample[];
}

export interface ApiModel {
  info: { title: string; version: string; description?: string };
  servers: string[];
  securitySchemes: Record<string, SecurityScheme>;
  tags: Array<{ name: string; slug: string; description?: string }>;
  operations: Operation[];
}
