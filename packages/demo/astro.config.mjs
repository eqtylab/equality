// @ts-check
import { defineConfig } from "astro/config";
import { fileURLToPath } from "url";
import { resolve } from "path";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

import react from "@astrojs/react";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@eqtylab/equality"],
    },
    resolve: {
      alias: {
        "@demo": resolve(__dirname, "./src"),
        "@demo/components": resolve(__dirname, "./src/components"),
        "@demo/lib": resolve(__dirname, "./src/lib"),
        "@demo/layouts": resolve(__dirname, "./src/layouts"),
        "@demo/pages": resolve(__dirname, "./src/pages"),
        "@demo/styles": resolve(__dirname, "./src/styles"),
        // Resolve @eqty/equality to local ui package when viewing demo
        "@eqtylab/equality": resolve(__dirname, "../ui/src"),
        "@/": resolve(__dirname, "../ui/src"),
        "@/components": resolve(__dirname, "../ui/src/components"),
        "@/lib": resolve(__dirname, "../ui/src/lib"),
        "@/types": resolve(__dirname, "../ui/src/types"),
        "@/theme": resolve(__dirname, "../ui/src/theme"),
        "@/hooks": resolve(__dirname, "../ui/src/hooks"),
      },
    },
  },
  integrations: [mdx(), react()],
});
