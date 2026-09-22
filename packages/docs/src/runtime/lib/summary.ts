/** Fallback page summary for pages with no `description` frontmatter. Build time only. */

const MAX_LENGTH = 140;

function isSkippable(line: string): boolean {
  return (
    line === '' ||
    line.startsWith('#') ||
    line.startsWith('import ') ||
    line.startsWith('export ') ||
    line.startsWith('<') ||
    line.startsWith('|') ||
    line.startsWith('>') ||
    line.startsWith('- ') ||
    line.startsWith('* ') ||
    /^\d+\.\s/.test(line)
  );
}

/** Enough markdown to make one sentence readable; anything richer is not a summary anyway. */
function stripMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string): string {
  if (text.length <= MAX_LENGTH) return text;
  const cut = text.slice(0, MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : MAX_LENGTH).trimEnd()}…`;
}

/** First paragraph of prose. Frontmatter is already stripped by the content loader. */
export function firstParagraph(body: string | undefined): string | undefined {
  if (!body) return undefined;

  let inFence = false;
  for (const raw of body.split('\n')) {
    const line = raw.trim();

    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence || isSkippable(line)) continue;

    const text = stripMarkdown(line);
    // A line that was nothing but a link or a tag strips to nothing; keep looking.
    if (text) return truncate(text);
  }
  return undefined;
}
