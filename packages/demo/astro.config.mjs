// @ts-check
import { defineConfig } from "astro/config";
import { readdirSync, readFileSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, posix, resolve } from "path";
import markdownExport from "astro-markdown-export";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

import react from "@astrojs/react";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const site = "https://equality.eqtylab.io";

const uiSrc = resolve(__dirname, "../ui/src");
const uiPkg = resolve(__dirname, "../ui/package.json");

// Resolve @eqty/equality to local ui package when viewing demo
const PKG = "@eqtylab/equality";
// Published CSS subpaths whose specifier doesn't match its path under src/.
/** @type {Record<string, string | undefined>} */
const CSS_SUBPATHS = {
  "theme-config.css": "theme/global-theme-config.css",
  "preflight.css": "theme/theme-preflight-global.css",
  "preflight-scoped.css": "theme/theme-preflight-scoped.css",
};
const resolveUiFromSource = {
  name: "resolve-ui-from-source",
  enforce: /** @type {const} */ ("pre"),
  /**
   * @this {any}
   * @param {string} id
   * @param {string | undefined} importer
   * @param {object} options
   */
  async resolveId(id, importer, options) {
    /** @type {string | undefined} */
    let target;
    const cssSubpath = id.startsWith(`${PKG}/`)
      ? CSS_SUBPATHS[id.slice(PKG.length + 1)]
      : undefined;
    if (cssSubpath) {
      target = resolve(uiSrc, cssSubpath);
    } else if (id === PKG) {
      target = uiSrc; // directory -> index.ts
    } else if (id.startsWith(`${PKG}/`)) {
      target = resolve(uiSrc, id.slice(PKG.length + 1));
    }
    if (!target) return null;
    // Delegate so Vite handles directory/extension resolution (e.g. index.ts).
    const resolved = await this.resolve(target, importer, {
      ...options,
      skipSelf: true,
    });
    return resolved ?? target;
  },
};

// The highlighter loads a grammar with import(`./grammars/${language}.js`), which no bundler
// expands, so the modules have to be emitted beside the chunk that asks for them
const microlighterGrammars = {
  name: "microlighter-grammars",
  apply: /** @type {const} */ ("build"),
  /**
   * @this {any}
   * @param {unknown} _options
   * @param {Record<string, { type: string, code?: string, fileName: string }>} bundle
   */
  generateBundle(_options, bundle) {
    const directories = new Set(
      Object.values(bundle)
        .filter(
          (output) =>
            output.type === "chunk" && output.code?.includes("grammars/${"),
        )
        .map((output) => posix.dirname(output.fileName)),
    );
    if (directories.size === 0) return;

    // Resolved through the ui package, which is what declares the highlighter
    const require = createRequire(uiPkg);
    const grammarDir = resolve(
      dirname(require.resolve("microlighter")),
      "grammars",
    );
    const grammars = readdirSync(grammarDir).filter((file) =>
      file.endsWith(".js"),
    );

    for (const directory of directories) {
      for (const grammar of grammars) {
        this.emitFile({
          type: "asset",
          fileName:
            directory === "."
              ? `grammars/${grammar}`
              : `${directory}/grammars/${grammar}`,
          source: readFileSync(resolve(grammarDir, grammar), "utf8"),
        });
      }
    }
  },
};

// Watch the UI source
const watchUiSource = {
  name: "watch-ui-source",
  /** @param {{ watcher: { add: (paths: string) => void } }} server */
  configureServer(server) {
    server.watcher.add(uiSrc);
  },
};

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  site,
  vite: {
    plugins: [
      tailwindcss(),
      resolveUiFromSource,
      watchUiSource,
      microlighterGrammars,
    ],
    resolve: {
      alias: {
        "@demo": resolve(__dirname, "./src"),
        "@demo/components": resolve(__dirname, "./src/components"),
        "@demo/lib": resolve(__dirname, "./src/lib"),
        "@demo/layouts": resolve(__dirname, "./src/layouts"),
        "@demo/pages": resolve(__dirname, "./src/pages"),
        "@demo/styles": resolve(__dirname, "./src/styles"),
      },
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-dark",
        dark: "github-dark",
      },
    },
  },
  integrations: [
    mdx(),
    react(),
    markdownExport({
      siteUrl: site,
      contentDir: "src/content/components",
      outputDir: "/components/",
      includeSourceUrls: true,
      normalizeExtension: true,
      additionalFrontmatter: {
        generator: "Astro Markdown Export",
        version: "1.0.0",
      },
    }),
  ],
});
