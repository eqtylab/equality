import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

import { resolveConfig, type DocsConfig, type DocsUserConfig } from './config.ts';
import { resolveDocsEnv, type DocsEnv } from './env.ts';
import { assertMdxOnly } from './internal/assert-mdx-only.ts';
import { EMPTY_VERSIONS, extractVersions } from './internal/extract-versions.ts';
import { microlighterGrammarsPlugin } from './internal/microlighter-grammars.ts';
import { pagefindIntegration } from './internal/pagefind.ts';
import { rehypeBaseUrl } from './internal/rehype-base-url.ts';
import { rehypeCodeFence } from './internal/rehype-code-fence.ts';
import { rehypeProseScope } from './internal/rehype-prose-scope.ts';
import { rehypeTableColumns } from './internal/rehype-table-columns.ts';
import { scanConsumerPages } from './internal/scan-consumer-pages.ts';
import { virtualConfigPlugin } from './internal/virtual-config.ts';

export { resolveConfig, type DocsConfig, type DocsUserConfig } from './config.ts';
export { resolveDocsEnv, type DocsEnv } from './env.ts';
// Do not re-export the loaders: this entry runs in Node when astro.config loads,
// and they import `astro:content`, which only exists in the Vite graph.
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

        assertMdxOnly(new URL(`./${cfg.contentDir}/`, config.srcDir));

        // Runs before the content layer syncs, so the version collections find their files.
        const versionData =
          cfg.versions === false
            ? EMPTY_VERSIONS
            : extractVersions({
                root: fileURLToPath(config.root),
                contentDirAbs: fileURLToPath(new URL(`./${cfg.contentDir}/`, config.srcDir)),
                cacheDir: fileURLToPath(new URL('./.astro/eqty-docs/', config.root)),
                current: cfg.versions.current,
                tags: cfg.versions.tags,
                granularity: cfg.versions.granularity,
                logger,
              });

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
          // Read by the catch-all's getStaticPaths so no path is emitted twice.
          ownedByConsumer: consumer.ownedPaths,
          ...versionData,
        };

        // So `_group.yaml` edits reload in dev.
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
          if (cfg.search.provider === 'pagefind' && !integrationNames.has('pagefind')) {
            added.push(pagefindIntegration());
          }
        }

        const vitePlugins: unknown[] = [virtualConfigPlugin(() => payload)];

        // Shiki tokenises at build time and needs no grammars emitted.
        if (cfg.code.highlighter === 'codeblock') {
          vitePlugins.push(microlighterGrammarsPlugin(config.root, logger));
        }

        if (cfg.autoIntegrations) {
          // Cast first: `.flat(Infinity)` over Vite's recursive PluginOption hits TS2589.
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

        // Typed loosely on purpose: inlining this hits "type instantiation is excessively deep".
        const markdown: Record<string, unknown> =
          cfg.code.highlighter === 'codeblock'
            ? {
                // Shiki must be off so the `pre` override receives raw source.
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

        // Astro does not apply `base` to authored markdown links. MDX inherits these via extendMarkdownConfig.
        markdown.rehypePlugins = [
          [
            rehypeBaseUrl,
            {
              base: config.base,
              pathPrefix: cfg.pathPrefix,
              versionsDir: fileURLToPath(new URL('./.astro/eqty-docs/versions/', config.root)),
            },
          ],
          rehypeProseScope,
          rehypeTableColumns,
          ...(cfg.code.highlighter === 'codeblock' ? [rehypeCodeFence] : []),
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
            `    currentVersion: { id: string; group: string; version: string } | null;`,
            `    versionManifest: Array<{ id: string; suffix: string; group: string; tag: string; dir: string }>;`,
            `    versionRedirects: Array<{ id: string; to: string | null }>;`,
            `  };`,
            `  export default config;`,
            `}`,
            '',
          ].join('\n'),
        });
      },

      'astro:routes:resolved'({ routes, logger }) {
        // Catches collisions the filesystem scan cannot see.
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
