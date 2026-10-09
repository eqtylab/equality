import path from 'node:path';

import { git, realpath } from './extract-versions.ts';

export interface RepositoryLinks {
  /** "Edit this page" base; the page's path inside the content directory is appended. */
  editBase?: string;
  issueHref?: string;
}

/** Where the content directory sits in its git checkout, or null outside one. */
export function contentPathInRepo(root: string, contentDirAbs: string): string | null {
  try {
    const repoRoot = git(root, 'rev-parse', '--show-toplevel');
    return path.relative(realpath(repoRoot), realpath(contentDirAbs)).split(path.sep).join('/');
  } catch {
    return null;
  }
}

export function repositoryLinks(
  repository: { url: string; branch: string } | undefined,
  contentPath: string | null,
  feedback?: string
): RepositoryLinks {
  if (!repository) return feedback ? { issueHref: feedback } : {};
  const url = repository.url.replace(/\/$/, '');
  return {
    editBase:
      contentPath === null
        ? undefined
        : [url, 'edit', repository.branch, contentPath].filter(Boolean).join('/'),
    issueHref: feedback ?? `${url}/issues/new`,
  };
}
