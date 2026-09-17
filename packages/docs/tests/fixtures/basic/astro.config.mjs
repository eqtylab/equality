import docs from '@eqtylab/docs';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.test',
  base: process.env.DOCS_BASE ?? '/',
  integrations: [docs({ title: 'Fixture Docs', description: 'Nav ordering fixture' })],
});
