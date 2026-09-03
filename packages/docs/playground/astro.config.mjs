// Dev-only consumer for @eqtylab/docs. Never published (the package's `files`
// field ships only dist/ and README.md) and never deployed.
//
// Dependencies resolve upward through packages/docs/node_modules, so this needs
// no install of its own — and it consumes the package by NAME, through the real
// exports map, rather than by relative path.
import docs from '@eqtylab/docs';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://playground.localhost',
  // Set DOCS_BASE=/v0.0/ to exercise a versioned sub-path build locally.
  base: process.env.DOCS_BASE ?? '/',
  integrations: [
    docs({
      title: 'Docs Playground',
      description: 'Standalone test content for developing @eqtylab/docs',
      header: {
        links: [
          {
            label: 'GitHub',
            href: 'https://github.com/eqtylab/equality',
            icon: 'Code',
            external: true,
          },
        ],
      },
      footer: {
        editUrl:
          'https://github.com/eqtylab/equality/edit/main/packages/docs/playground/src/content/docs/',
      },
    }),
  ],
});
