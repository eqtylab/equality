import { ingest } from './ingest.ts';
import { buildModel } from './model.ts';
import { samplesFor } from './samples.ts';
import type { ApiModel } from './types.ts';

export { modelId, operationEntryId } from './fan-out.ts';
export { OpenApiError } from './ingest.ts';
export { markdownFor } from './markdown.ts';
export { METHOD_VARIANT } from './types.ts';
export type * from './types.ts';

export async function loadOpenApi(
  text: string,
  file: string,
  onWarn?: (message: string) => void
): Promise<ApiModel> {
  const model = buildModel(await ingest(text, file), file, onWarn);
  for (const op of model.operations) op.samples = samplesFor(op, model.servers);
  return model;
}
