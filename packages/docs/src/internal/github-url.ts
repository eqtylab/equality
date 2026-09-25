export const GITHUB_HOST = /^(?:https?:\/\/)?(?:www\.)?github\.com\//i;

/** A GitHub URL from a `package.json` `repository` field, in any form npm accepts. */
export function githubUrl(repository: unknown): string | undefined {
  const raw =
    typeof repository === 'string'
      ? repository
      : (repository as { url?: unknown } | undefined)?.url;
  if (typeof raw !== 'string') return undefined;

  const shorthand = raw.match(/^(?:github:)?([\w.-]+)\/([\w.-]+?)(?:\.git)?$/);
  if (shorthand) return `https://github.com/${shorthand[1]}/${shorthand[2]}`;

  const full = raw.match(/github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?(?:[#?].*)?$/i);
  return full ? `https://github.com/${full[1]}/${full[2]}` : undefined;
}
