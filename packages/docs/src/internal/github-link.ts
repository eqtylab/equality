import { brandAssets, type DocsConfig } from '../config.ts';
import { GITHUB_HOST, githubUrl } from './github-url.ts';

export { githubUrl };

type HeaderLink = DocsConfig['header']['links'][number];

export const EQTY_GITHUB = 'https://github.com/eqtylab';

export function withGithubLink(
  links: HeaderLink[],
  github: string | false | undefined,
  repository: unknown
): HeaderLink[] {
  if (github === false || links.some((l) => GITHUB_HOST.test(l.href))) return links;
  const href = github ?? githubUrl(repository) ?? EQTY_GITHUB;
  return [...links, { label: 'GitHub', href, icon: brandAssets.github, external: true }];
}
