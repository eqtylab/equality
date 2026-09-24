import type { ApiModel, Operation, SchemaNode } from './types.ts';

const cell = (value: string | undefined) =>
  (value ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ');

function typeOf(schema?: SchemaNode): string {
  if (!schema) return '';
  if (schema.recursive) return `${schema.type ?? 'object'} (recursive)`;
  if (schema.type === 'array') return `${typeOf(schema.items)}[]`;
  return [schema.type, schema.format].filter(Boolean).join(' ');
}

export function markdownFor(op: Operation, model: ApiModel): string {
  const lines = [`\`${op.method.toUpperCase()} ${op.path}\``, ''];
  if (op.deprecated) lines.push('> **Deprecated.**', '');

  if (op.security.length) {
    lines.push('## Authorization', '');
    for (const alternative of op.security) {
      lines.push(
        `- ${alternative.map(({ scheme }) => model.securitySchemes[scheme]?.description ?? scheme).join(' and ')}`
      );
    }
    lines.push('');
  }

  if (op.parameters.length || op.requestBody) {
    lines.push('## Parameters', '');
    if (op.parameters.length) {
      lines.push('| Name | In | Type | Required | Description |', '|---|---|---|---|---|');
      for (const p of op.parameters) {
        lines.push(
          `| \`${p.name}\` | ${p.in} | ${cell(typeOf(p.schema))} | ${p.required ? 'yes' : 'no'} | ${cell(p.description)} |`
        );
      }
      lines.push('');
    }
    for (const body of op.requestBody?.content ?? []) {
      lines.push(
        `Request body, \`${body.mediaType}\`${op.requestBody?.required ? ', required' : ''}: ${typeOf(body.schema)}`,
        ''
      );
    }
  }

  lines.push('## Responses', '');
  for (const r of op.responses) lines.push(`- **${r.status}**: ${cell(r.description)}`);
  lines.push('');

  for (const s of op.samples)
    lines.push(`### ${s.label}`, '', `\`\`\`${s.lang}`, s.code, '```', '');
  return lines.join('\n');
}
