export const GITHUB_HOST = /^https?:\/\/(?:www\.)?github\.com\//i;

/** `owner/repo` or a github.com URL, as a URL. Anything else names no repo. */
export function githubUrl(value: string): string | undefined {
  if (GITHUB_HOST.test(value)) return value;
  const repo = value.match(/^([\w.-]+)\/([\w.-]+)$/);
  return repo ? `https://github.com/${repo[1]}/${repo[2]}` : undefined;
}
