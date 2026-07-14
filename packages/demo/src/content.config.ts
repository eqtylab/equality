import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const components = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/components" }),
  schema: z.object({
    heading: z.string(),
    description: z.string().optional(),
    // Marks a component as deprecated. Renders a warning callout on the docs
    // page and a warning tag in the sidebar. Pair with the `@deprecated` JSDoc
    // tag on the component itself in the `ui` package.
    deprecated: z.boolean().default(false),
    // Optional message shown in the deprecation callout. Supports inline HTML
    // (e.g. a link to the replacement component).
    deprecatedMessage: z.string().optional(),
  }),
});

export const collections = { components };
