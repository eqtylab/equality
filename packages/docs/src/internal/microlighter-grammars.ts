/**
 * Emits microlighter's grammar modules beside the chunks that ask for them.
 *
 * Equality's CodeBlock reaches a grammar with `import('./grammars/' + language)`,
 * a dynamic specifier no bundler can expand, so Rollup leaves the import in the
 * chunk with nothing on disk to satisfy it. The build still succeeds; fenced code
 * just renders unhighlighted. Upstream fix eqtylab/equality#134 solved this in the
 * demo's own astro.config, which meant only the demo got highlighting.
 *
 * It lives here because every consumer rendering fences through CodeBlock needs
 * it, and none of them should have to know that microlighter exists.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { AstroIntegrationLogger } from 'astro';
import type { Plugin } from 'vite';

/** The residue of the un-expandable dynamic import, left in the emitted chunk. */
const GRAMMAR_IMPORT = 'grammars/${';

/**
 * microlighter is a dependency of @eqtylab/equality, which is only a peer of this
 * package, so it is resolved in two hops from the consumer's project: neither has
 * to appear in this package's own node_modules. The demo's version resolved it
 * through a hard-coded '../ui/package.json', which exists in this monorepo alone.
 */
function findGrammarDir(projectRoot: URL): string {
  const requireFromProject = createRequire(new URL('package.json', projectRoot));
  const equalityEntry = requireFromProject.resolve('@eqtylab/equality');
  const requireFromEquality = createRequire(equalityEntry);
  return path.resolve(path.dirname(requireFromEquality.resolve('microlighter')), 'grammars');
}

export function microlighterGrammarsPlugin(
  projectRoot: URL,
  logger: AstroIntegrationLogger
): Plugin {
  return {
    name: 'eqty-docs:microlighter-grammars',
    // Dev serves the grammars from source through Vite's own resolution.
    apply: 'build',
    generateBundle(_options, bundle) {
      const directories = new Set(
        Object.values(bundle)
          .filter((output) => output.type === 'chunk' && output.code.includes(GRAMMAR_IMPORT))
          .map((output) => path.posix.dirname(output.fileName))
      );
      if (directories.size === 0) return;

      let grammarDir: string;
      let grammars: string[];
      try {
        grammarDir = findGrammarDir(projectRoot);
        grammars = readdirSync(grammarDir).filter((file) => file.endsWith('.js'));
      } catch (error) {
        // A throw here would fail a build over a cosmetic feature. A silent
        // return is what this plugin exists to prevent, so say it loudly.
        logger.warn(
          'Code blocks ask for microlighter grammars, but they could not be resolved. ' +
            'Fenced code will render unhighlighted. Check that @eqtylab/equality is ' +
            `installed in this project.\n  ${String(error)}`
        );
        return;
      }

      for (const directory of directories) {
        for (const grammar of grammars) {
          this.emitFile({
            type: 'asset',
            fileName:
              directory === '.' ? `grammars/${grammar}` : `${directory}/grammars/${grammar}`,
            source: readFileSync(path.resolve(grammarDir, grammar), 'utf8'),
          });
        }
      }
    },
  };
}
