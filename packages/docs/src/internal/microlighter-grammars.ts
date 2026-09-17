/**
 * Emits microlighter's grammar modules beside the chunks that ask for them.
 * CodeBlock loads grammars with `import('./grammars/' + language)`, which no
 * bundler can expand; without this the build succeeds and code renders unhighlighted.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { AstroIntegrationLogger } from 'astro';
import type { Plugin } from 'vite';

/** Residue of the dynamic import in the emitted chunk. */
const GRAMMAR_IMPORT = 'grammars/${';

/** Two hops from the consumer: microlighter is a dependency of @eqtylab/equality, which is only a peer here. */
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
        // Warn rather than fail the build over highlighting.
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
