import type { Operation } from '@eqtylab/docs/openapi';

export function operationHeadings(op: Operation) {
  const out: Array<{ depth: 2; slug: string; text: string }> = [];
  if (op.security.length) out.push({ depth: 2, slug: 'authorization', text: 'Authorization' });
  if (op.parameters.length || op.requestBody) {
    out.push({ depth: 2, slug: 'parameters', text: 'Parameters' });
  }
  out.push({ depth: 2, slug: 'responses', text: 'Responses' });
  return out;
}
