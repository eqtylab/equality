#!/usr/bin/env node
// Rewrites pre-conversion frontmatter in place: heading -> title, drop layout,
// deprecated + deprecatedMessage -> deprecated: { message }. Usage: node convert-frontmatter.mjs <file>...
import { readFileSync, writeFileSync } from "node:fs";

for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, "utf8");
  const m = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!m) continue;
  let lines = m[1].split("\n");
  let message;
  lines = lines.flatMap((line) => {
    if (/^layout:/.test(line)) return [];
    if (/^heading:/.test(line)) return [line.replace(/^heading:/, "title:")];
    const dm = /^deprecatedMessage:\s*(.*)$/.exec(line);
    if (dm) {
      message = dm[1];
      return [];
    }
    return [line];
  });
  if (message !== undefined) {
    lines = lines.filter((line) => !/^deprecated:/.test(line));
    lines.push("deprecated:", `  message: ${message}`);
  }
  writeFileSync(
    file,
    `---\n${lines.join("\n")}\n---\n${src.slice(m[0].length)}`,
  );
}
