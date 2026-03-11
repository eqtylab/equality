import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async (ctx) => {
  const entries = await getCollection("components");

  const sorted = entries.sort((a, b) =>
    a.data.heading.localeCompare(b.data.heading),
  );

  const base = (ctx.site ?? new URL(ctx.request.url)).origin;

  const lines = [
    "# Components",
    "",
    ...sorted.map((entry) => {
      const desc = entry.data.description ? ` — ${entry.data.description}` : "";
      return `- [${entry.data.heading}](${base}/components/${entry.id}.md)${desc}`;
    }),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
