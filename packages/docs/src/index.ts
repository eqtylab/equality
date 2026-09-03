import type { AstroIntegration } from 'astro';

import { resolveConfig, type DocsConfig, type DocsUserConfig } from './config.ts';
import { resolveDocsEnv, type DocsEnv } from './env.ts';
import { assertMdxOnly } from './internal/assert-mdx-only.ts';
import { rehypeBaseUrl } from './internal/rehype-base-url.ts';
import { rehypeTableColumns } from './internal/rehype-table-columns.ts';
import { scanConsumerPages } from './internal/scan-consumer-pages.ts';
import { virtualConfigPlugin } from './internal/virtual-config.ts';

export { resolveConfig, type DocsConfig, type DocsUserConfig } from './config.ts';
export { resolveDocsEnv, type DocsEnv } from './env.ts';
// NOTE: loaders are deliberately NOT re-exported here. This entry is loaded by
// Node when it reads astro.config, whereas the loaders import `astro:content`,
// which only exists inside the Vite graph. Consumers import them from
// '@eqtylab/docs/loaders' in src/content.config.ts, which is Vite-loaded.
export { docsSchema, groupSchema, badgeSchema } from './schema.ts';
export * from './types.ts';

export interface DocsIntegrationOptions extends DocsUserConfig {
  /** Build environment for versioned deploys. Defaults to `resolveDocsEnv()`. */
  env?: Partial<DocsEnv>;
}

/** Route patterns the integration would like to own, paired with their entrypoints. */
function plannedRoutes(cfg: DocsConfig) {
  const prefix = cfg.pathPrefix ? `/${cfg.pathPrefix.replace(/^\/|\/$/g, '')}` : '';
  const routes: Array<{ pattern: string; entrypoint: string; enabled: boolean }> = [
    {
      pattern: `${prefix}/[...slug]`,
      entrypoint: '@eqtylab/docs/routes/docs.astro',
      enabled: cfg.routing.injectPages,
    },
    {
      pattern: `${prefix}/[...slug].md`,
      entrypoint: '@eqtylab/docs/routes/docs-md.ts',
      enabled: cfg.routing.markdownTwins,
    },
    {
      pattern: '/llms.txt',
      entrypoint: '@eqtylab/docs/routes/llms-txt.ts',
      enabled: cfg.routing.markdownTwins,
    },
    {
      pattern: '/_docs/search.json',
      entrypoint: '@eqtylab/docs/routes/search-index.ts',
      enabled: cfg.search.provider !== 'none' || cfg.search.devProvider !== 'none',
    },
    {
      pattern: '/404',
      entrypoint: '@eqtylab/docs/routes/not-found.astro',
      enabled: cfg.routing.notFound,
    },
  ];
  return routes.filter((r) => r.enabled);
}

export default function docs(
  options: DocsIntegrationOptions = {} as DocsIntegrationOptions
): AstroIntegration {
  const { env: envOverrides, ...userConfig } = options;
  const cfg = resolveConfig(userConfig);
  const env = resolveDocsEnv(envOverrides);

  let payload: Record<string, unknown> = {};

  return {
    name: '@eqtylab/docs',
    hooks: {
      async 'astro:config:setup'(params) {
        const { config, injectRoute, updateConfig, addWatchFile, logger, command } = params;

        // Content is MDX-only; a .md file would be skipped by the loader and
        // silently missing from the site.
        assertMdxOnly(new URL(`./${cfg.contentDir}/`, config.srcDir));

        const consumer = scanConsumerPages(config.srcDir);

        for (const route of plannedRoutes(cfg)) {
          if (consumer.claimedPatterns.has(route.pattern)) {
            logger.info(
              `yielding ${route.pattern} to your own src/pages file (docs route not injected)`
            );
            continue;
          }
          injectRoute({ pattern: route.pattern, entrypoint: route.entrypoint, prerender: true });
        }

        payload = {
          ...cfg,
          env,
          // Consumed by the catch-all's getStaticPaths so a consumer page and the
          // docs route never both emit the same path.
          ownedByConsumer: consumer.ownedPaths,
        };

        // Watch _group.yaml files so ordering edits reload in dev.
        if (command === 'dev') {
          addWatchFile(new URL(`./${cfg.contentDir}/`, config.srcDir));
        }

        const integrationNames = new Set(config.integrations.map((i) => i.name));
        const added: AstroIntegration[] = [];

        if (cfg.autoIntegrations) {
          if (!integrationNames.has('@astrojs/mdx')) {
            const { default: mdx } = await import('@astrojs/mdx');
            added.push(mdx());
          }
          if (!integrationNames.has('@astrojs/react')) {
            const { default: react } = await import('@astrojs/react');
            added.push(react());
          }
        }

        const vitePlugins: unknown[] = [virtualConfigPlugin(() => payload)];

        if (cfg.autoIntegrations) {
          // Cast before flattening: Vite's PluginOption is recursively nested,
          // and .flat(Infinity) over that type hits TS2589.
          const existing = (config.vite?.plugins ?? []) as unknown[];
          const hasTailwind = existing
            .flat(Infinity as 1)
            .some(
              (p) =>
                typeof (p as { name?: string })?.name === 'string' &&
                (p as { name: string }).name.includes('tailwind')
            );
          if (!hasTailwind) {
            const { default: tailwindcss } = await import('@tailwindcss/vite');
            vitePlugins.push(tailwindcss());
          }
        }

        // Built separately and typed loosely on purpose: inlining this object
        // makes TS chase DeepPartial<AstroConfig> and hit "type instantiation is
        // excessively deep".
        const markdown: Record<string, unknown> =
          cfg.code.highlighter === 'codeblock'
            ? {
                // Fenced code goes through our own `pre` override so it can
                // render via Equality's CodeBlock. Leaving Shiki on would
                // tokenise the fence first, and recovering raw source from its
                // hast is strictly worse than never highlighting twice.
                syntaxHighlight: false,
              }
            : {
                shikiConfig: {
                  themes: cfg.code.themes,
                  defaultColor: false,
                  wrap: cfg.code.wrap,
                  ...(cfg.code.langs.length ? { langs: cfg.code.langs } : {}),
                },
              };

        // Astro does not rewrite authored markdown links for `base`, so every
        // root-relative link in content would 404 in a sub-path build. MDX
        // inherits markdown.rehypePlugins via extendMarkdownConfig.
        markdown.rehypePlugins = [
          [rehypeBaseUrl, { base: config.base }],
          // Equality's Table is a CSS grid and needs an explicit track count.
          rehypeTableColumns,
        ];

        updateConfig({
          integrations: added,
          vite: { plugins: vitePlugins as never },
          markdown,
        } as never);
      },

      'astro:config:done'({ injectTypes }) {
        injectTypes({
          filename: 'types.d.ts',
          content: [
            `declare module 'virtual:eqty-docs/config' {`,
            `  const config: import('@eqtylab/docs').DocsConfig & {`,
            `    env: import('@eqtylab/docs').DocsEnv;`,
            `    ownedByConsumer: string[];`,
            `  };`,
            `  export default config;`,
            `}`,
            '',
          ].join('\n'),
        });
      },

      'astro:routes:resolved'({ routes, logger }) {
        // Safety net for collisions the filesystem scan cannot see.
        const seen = new Map<string, string>();
        for (const route of routes as Array<{ pattern: string; entrypoint: string }>) {
          const previous = seen.get(route.pattern);
          if (previous && previous !== route.entrypoint) {
            logger.warn(
              `Route ${route.pattern} is claimed twice:\n  ${previous}\n  ${route.entrypoint}\n` +
                `One of them will be overwritten in the static build.`
            );
          }
          seen.set(route.pattern, route.entrypoint);
        }
      },
    },
  };
}
