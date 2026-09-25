// @ts-check
import { createRequire } from "node:module";

import { defineConfig } from "astro/config";
import docs, { brandAssets, resolveDocsEnv } from "@eqtylab/docs";
import { linkWorkspacePackages } from "@eqtylab/docs/dev";

// The version the site documents is the library's, not this package's 0.0.1.
const ui = createRequire(import.meta.url)("../ui/package.json");

// `base` has to be literal in Astro's config at build time, so a versioned build
// threads it through the environment. See @eqtylab/docs' README.
const env = resolveDocsEnv({ site: "https://equality.eqtylab.io" });

// In-monorepo dev resolves @eqtylab/equality from source for instant HMR. CI
// builds against the real published artifact instead.
const linkSource =
  process.env.EQ_LINK_SOURCE === "1" ||
  (!process.env.CI && process.env.NODE_ENV !== "production");

export default defineConfig({
  site: env.site,
  base: env.base,
  trailingSlash: "ignore",
  build: { format: "directory" },
  devToolbar: { enabled: false },
  vite: {
    plugins: linkSource
      ? linkWorkspacePackages({ "@eqtylab/equality": "../ui" })
      : [],
  },
  integrations: [
    docs({
      env,
      title: "Equality",
      description: "A theme-driven component library for EQTY Lab projects",
      versions: { current: ui.version, granularity: "minor" },
      logo: {
        src: brandAssets.logo,
        alt: "EQTY Lab",
      },
      header: {
        links: [
          {
            label: "GitHub",
            href: "https://github.com/eqtylab/equality",
            icon: brandAssets.github,
            external: true,
          },
        ],
      },
      footer: {
        editUrl:
          "https://github.com/eqtylab/equality/edit/main/packages/demo/src/content/docs/",
      },
    }),
  ],
});
