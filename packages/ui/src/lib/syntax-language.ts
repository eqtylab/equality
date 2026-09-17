/**
 * Which grammar highlights which file, keyed by extension.
 *
 * An extension that is absent renders as plain monospace rather than being guessed at: a wrong
 * grammar colours worse than none. Every value has to name a grammar the bundled highlighter
 * ships, which `src/scripts/check-grammars.js` asserts against its grammar directory on every
 * build.
 */
export const GRAMMAR_BY_EXTENSION: Record<string, string> = {
  as: 'assembly',
  asm: 'assembly',
  astro: 'astro',
  bash: 'bash',
  c: 'c',
  cc: 'cpp',
  cpp: 'cpp',
  cs: 'csharp',
  css: 'css',
  dart: 'dart',
  diff: 'git-diff',
  ex: 'elixir',
  exs: 'elixir',
  go: 'go',
  gql: 'graphql',
  graphql: 'graphql',
  h: 'c',
  heex: 'heex',
  hpp: 'cpp',
  htm: 'html',
  html: 'html',
  ini: 'ini',
  java: 'java',
  js: 'javascript',
  json: 'json',
  jsonc: 'json',
  jsx: 'javascript',
  kt: 'kotlin',
  kts: 'kotlin',
  lua: 'lua',
  m: 'objective-c',
  markdown: 'markdown',
  md: 'markdown',
  mdx: 'markdown',
  mjs: 'javascript',
  patch: 'git-diff',
  php: 'php',
  pl: 'perl',
  ps1: 'powershell',
  py: 'python',
  r: 'r',
  rb: 'ruby',
  rs: 'rust',
  sass: 'scss',
  scss: 'scss',
  sh: 'bash',
  sql: 'sql',
  svelte: 'svelte',
  swift: 'swift',
  toml: 'toml',
  ts: 'typescript',
  tsx: 'tsx',
  vue: 'vue',
  xml: 'html',
  yaml: 'yaml',
  yml: 'yaml',
  zsh: 'bash',
};

/** Files the ecosystem names rather than extends. */
export const GRAMMAR_BY_FILENAME: Record<string, string> = {
  dockerfile: 'dockerfile',
  gemfile: 'ruby',
  makefile: 'bash',
  'nginx.conf': 'nginx',
  procfile: 'bash',
  rakefile: 'ruby',
};

const basenameOf = (fileName: string) => fileName.split('/').pop()?.toLowerCase() ?? '';

// `.` alone is not an extension separator here: `.gitignore` is a name, not an extension.
const extensionOf = (fileName: string) => {
  const name = basenameOf(fileName);
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1) : '';
};

/**
 * The grammar for a file, by its own name first and then its extension.
 *
 * Matches on the basename, so a directory called `json/` cannot stand in for an extension.
 */
export const grammarForFilename = (fileName: string): string | undefined =>
  GRAMMAR_BY_FILENAME[basenameOf(fileName)] ?? GRAMMAR_BY_EXTENSION[extensionOf(fileName)];

/**
 * Whether a name carries an extension at all.
 *
 * An extension this map does not cover is still the file's own answer — it says what it is and we
 * do not highlight it — so callers that fall back to sniffing bytes should only do so for a name
 * with nothing to go on. A leading dot is part of the name, so `.eslintrc` reports no extension.
 */
export const hasFileExtension = (fileName: string): boolean => extensionOf(fileName) !== '';
