// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";
import { resolve } from "path";
import markdownExport from "astro-markdown-export";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

import react from "@astrojs/react";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const site = "https://equality.eqtylab.io";

const uiSrc = resolve(__dirname, "../ui/src");

// Resolve @eqty/equality to local ui package when viewing demo
const PKG = "@eqtylab/equality";
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
    if (id === `${PKG}/theme-config.css`) {
      target = resolve(uiSrc, "theme/global-theme-config.css");
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
    plugins: [tailwindcss(), resolveUiFromSource, watchUiSource],
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
