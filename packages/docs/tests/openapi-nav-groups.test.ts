import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openApiGroups } from '../src/openapi/nav-groups.ts';

const model = {
  id: 'ref/api/~api',
  data: {
    generated: 'model',
    owner: 'ref/api',
    api: {
      tags: [
        { name: 'API Keys', slug: 'api-keys' },
        { name: 'Health', slug: 'health' },
      ],
      operations: [
        { slug: 'b', tagSlug: 'api-keys' },
        { slug: 'a', tagSlug: 'api-keys' },
        { slug: 'health', tagSlug: 'health' },
      ],
    },
  },
};

test('the owner orders its tags, and each tag keeps its name and document order', () => {
  const groups = openApiGroups([model, { id: 'other', data: { title: 'x' } }]);
  assert.deepEqual(groups.get('ref/api')!.order, ['api-keys', 'health']);
  assert.equal(groups.get('ref/api/api-keys')!.label, 'API Keys');
  assert.deepEqual(groups.get('ref/api/api-keys')!.order, ['b', 'a']);
  assert.equal(groups.size, 3);
});
