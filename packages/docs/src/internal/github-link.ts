import { brandAssets, type DocsConfig } from '../config.ts';
import { GITHUB_HOST, githubUrl } from './github-url.ts';

export { githubUrl };

type HeaderLink = DocsConfig['header']['links'][number];

export const EQTY_GITHUB = 'https://github.com/eqtylab';

export function withGithubLink(
  links: HeaderLink[],
  github: string | false | undefined
): HeaderLink[] {
  const own = links.map((l) =>
    GITHUB_HOST.test(l.href) && !l.icon ? { ...l, icon: brandAssets.github } : l
  );
  if (github === false || links.some((l) => GITHUB_HOST.test(l.href))) return own;
  return [
    ...own,
    { label: 'GitHub', href: github ?? EQTY_GITHUB, icon: brandAssets.github, external: true },
  ];
}
