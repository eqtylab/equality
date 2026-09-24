import { dereference, upgradeFromTwoToThree } from '@scalar/openapi-parser';
import { parseDocument, parse as parseYaml, YAMLParseError } from 'yaml';

import type { OpenApiDocument } from './types.ts';

export class OpenApiError extends Error {
  readonly file: string;

  constructor(file: string, detail: string, fix: string) {
    super(`[@eqtylab/docs] ${file}: ${detail}\n  ${fix}`);
    this.name = 'OpenApiError';
    this.file = file;
  }
}

function parseText(text: string, file: string): Record<string, unknown> {
  try {
    const value = file.endsWith('.json')
      ? JSON.parse(text)
      : parseYaml(text, { prettyErrors: true });
    if (!value || typeof value !== 'object') {
      throw new OpenApiError(
        file,
        'the file is empty or not an object.',
        "Check that it is the service's OpenAPI description."
      );
    }
    return value as Record<string, unknown>;
  } catch (err) {
    if (err instanceof OpenApiError) throw err;
    const where =
      err instanceof YAMLParseError && err.linePos
        ? ` at line ${err.linePos[0].line}, column ${err.linePos[0].col}`
        : jsonPosition(text, err as Error);
    throw new OpenApiError(
      file,
      `could not parse${where}: ${(err as Error).message.split('\n')[0]}`,
      'Fix the syntax at that position, then rebuild.'
    );
  }
}

function jsonPosition(text: string, err: Error): string {
  const direct = /line (\d+) column (\d+)/.exec(err.message);
  if (direct) return ` at line ${direct[1]}, column ${direct[2]}`;
  const match = /position (\d+)/.exec(err.message);
  if (match) {
    const before = text.slice(0, Number(match[1])).split('\n');
    return ` at line ${before.length}, column ${(before.at(-1)?.length ?? 0) + 1}`;
  }
  // Node's JSON.parse gives no line/column/position on some inputs (verified on
  // Node 24.20 for a missing value after a key). Re-parsing as YAML in JSON
  // mode finds the same failure point with a usable position.
  const yamlErrors = parseDocument(text, { schema: 'json' }).errors;
  if (yamlErrors.length && yamlErrors[0].linePos) {
    const { line, col } = yamlErrors[0].linePos[0];
    return ` at line ${line}, column ${col}`;
  }
  return '';
}

export async function ingest(text: string, file: string): Promise<OpenApiDocument> {
  let raw = parseText(text, file);

  if (raw.swagger === '2.0') {
    raw = upgradeFromTwoToThree(structuredClone(raw)) as Record<string, unknown>;
  } else if (typeof raw.openapi !== 'string' || !/^3\.[01]\./.test(raw.openapi)) {
    const found = JSON.stringify(raw.openapi ?? raw.swagger ?? null);
    throw new OpenApiError(
      file,
      `expected swagger: "2.0" or openapi: 3.x, found ${found}.`,
      'Only Swagger 2.0 and OpenAPI 3.0 or 3.1 are supported.'
    );
  }

  const { schema, errors } = await dereference(raw);
  if (errors?.length) {
    throw new OpenApiError(
      file,
      errors.map((e) => e.message).join('; '),
      'Add the missing definition or correct the $ref.'
    );
  }
  return schema as unknown as OpenApiDocument;
}
