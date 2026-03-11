import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const components = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/components" }),
  schema: z.object({
    heading: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { components };
