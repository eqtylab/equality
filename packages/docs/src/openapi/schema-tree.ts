import type { SchemaNode } from './types.ts';

type Raw = Record<string, unknown>;

const SCALARS = [
  'type',
  'format',
  'description',
  'enum',
  'example',
  'default',
  'nullable',
  'deprecated',
] as const;
// `items`/`additionalProperties` hold a single child schema directly, not a group of them —
// tracking them here would seed a node's own next `raw` value as its own ancestor.
const GROUP_CONTAINERS = ['properties', 'oneOf', 'anyOf', 'allOf'] as const;

/**
 * dereference shares a $ref target's properties/items by reference, so a cycle shows up as a
 * repeated container before a repeated wrapper.
 */
function seenBefore(raw: Raw, wrappers: Set<object>, containers: Set<object>): boolean {
  if (wrappers.has(raw)) return true;
  return GROUP_CONTAINERS.some((key) => {
    const container = raw[key];
    return (
      Boolean(container) && typeof container === 'object' && containers.has(container as object)
    );
  });
}

/** `dereference` leaves circular refs as real object cycles; the ancestor sets are what make the result finite. */
export function toSchemaNode(
  schema: unknown,
  required = false,
  wrappers = new Set<object>(),
  containers = new Set<object>()
): SchemaNode | undefined {
  if (!schema || typeof schema !== 'object') return undefined;
  const raw = schema as Raw;
  if (seenBefore(raw, wrappers, containers)) {
    return { type: typeof raw.type === 'string' ? raw.type : undefined, recursive: true };
  }

  const nextWrappers = new Set(wrappers).add(raw);
  const nextContainers = new Set(containers);
  for (const key of GROUP_CONTAINERS) {
    const container = raw[key];
    if (container && typeof container === 'object') nextContainers.add(container as object);
  }
  const node: SchemaNode = {};
  for (const key of SCALARS) if (raw[key] !== undefined) (node as Raw)[key] = raw[key];
  if (required) node.required = true;

  const requiredNames = new Set(Array.isArray(raw.required) ? (raw.required as string[]) : []);
  if (raw.properties && typeof raw.properties === 'object') {
    node.properties = Object.entries(raw.properties as Raw).flatMap(([name, value]) => {
      const child = toSchemaNode(value, requiredNames.has(name), nextWrappers, nextContainers);
      return child ? [{ name, schema: child }] : [];
    });
  }
  if (raw.items) node.items = toSchemaNode(raw.items, false, nextWrappers, nextContainers);
  for (const key of ['oneOf', 'anyOf', 'allOf'] as const) {
    if (Array.isArray(raw[key])) {
      node[key] = (raw[key] as unknown[]).flatMap(
        (s) => toSchemaNode(s, false, nextWrappers, nextContainers) ?? []
      );
    }
  }
  if (typeof raw.additionalProperties === 'boolean')
    node.additionalProperties = raw.additionalProperties;
  else if (raw.additionalProperties) {
    node.additionalProperties = toSchemaNode(
      raw.additionalProperties,
      false,
      nextWrappers,
      nextContainers
    );
  }
  return node;
}
