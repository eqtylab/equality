import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  annotateDeclarations,
  collectDocs,
  SOURCE_DIRECTORY,
} from '../src/scripts/document-props.js';

// The script only lists a prop as the component's own when it is declared under src, so the
// fixture files are served from there without being written to disk
const programOf = (files: Record<string, string>) => {
  const virtual = new Map(
    Object.entries(files).map(([name, text]) => [`${SOURCE_DIRECTORY}/${name}`, text])
  );
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2021,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  };
  const host = ts.createCompilerHost(options, true);
  const { fileExists, readFile, getSourceFile } = host;
  host.fileExists = (fileName) => virtual.has(fileName) || fileExists(fileName);
  host.readFile = (fileName) => virtual.get(fileName) ?? readFile(fileName);
  host.getSourceFile = (fileName, languageVersion, ...rest) => {
    const text = virtual.get(fileName);
    return text === undefined
      ? getSourceFile(fileName, languageVersion, ...rest)
      : ts.createSourceFile(fileName, text, languageVersion, true);
  };
  return ts.createProgram({
    rootNames: [`${SOURCE_DIRECTORY}/index.ts`],
    options,
    host,
  });
};

const FIXTURE = `
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const fixtureVariants = cva('fixture', {
  variants: {
    /** How loudly it reads. */
    tone: { quiet: 'fixture--quiet', loud: 'fixture--loud' },
    size: { sm: 'fixture--sm', lg: 'fixture--lg' },
  },
  defaultVariants: { tone: 'quiet' },
});

interface FixtureProps extends VariantProps<typeof fixtureVariants> {
  /** Text shown inside. */
  label: string;
  /** Pass null to clear it. */
  selected?: string | null;
  customVars?: { [key: \`--\${string}\`]: string };
  separator?: '*/' | '|';
  count?: number;
}

/**
 * Shows a label.
 *
 * @deprecated Use Badge instead.
 */
export function Fixture({ count = 3, ...props }: FixtureProps) {
  return null;
}

type LinkProps = { href: string; label: string; target?: string };
type ActionProps = { href: never; label: string; disabled?: boolean };

export function LinkOrAction(props: LinkProps | ActionProps) {
  return null;
}

export function NativeButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return null;
}

export function Empty() {
  return null;
}
`;

describe('collectDocs', () => {
  let docs: ReturnType<typeof collectDocs>;

  beforeAll(() => {
    docs = collectDocs(
      programOf({
        'index.ts': "export * from './document-props-fixture';",
        'document-props-fixture.tsx': FIXTURE,
      })
    );
  });

  it('appends the props to the source comment, before its block tags', () => {
    expect(docs.components.get('Fixture')).toBe(
      [
        '/**',
        ' * Shows a label.',
        ' *',
        ' * **Props**',
        ' * - `tone?: "quiet" | "loud"` (default `"quiet"`) — How loudly it reads.',
        ' * - `size?: "sm" | "lg"`',
        ' * - `label: string` — Text shown inside.',
        ' * - `selected?: string | null` — Pass null to clear it.',
        ' * - `` customVars?: { [key: `--${string}`]: string; } ``',
        ' * - `separator?: "*\\/" | "|"`',
        ' * - `count?: number` (default `3`)',
        ' *',
        ' * @deprecated Use Badge instead.',
        ' */',
      ].join('\n')
    );
  });

  it('escapes */ so generated Markdown cannot close the comment early', () => {
    const comment = docs.components.get('Fixture');
    expect(comment.indexOf('*/')).toBe(comment.length - 2);
  });

  it('marks a prop required only when every branch of a union requires it', () => {
    expect(docs.components.get('LinkOrAction')).toBe(
      [
        '/**',
        ' * **Props**',
        ' * - `href?: string`',
        ' * - `label: string`',
        ' * - `target?: string`',
        ' * - `disabled?: boolean`',
        ' */',
      ].join('\n')
    );
  });

  it('summarises HTML attributes and says when there are no props', () => {
    expect(docs.components.get('NativeButton')).toContain(
      'Accepts the standard `HTMLButtonElement` attributes'
    );
    expect(docs.components.get('Empty')).toBe('/**\n * Takes no props.\n */');
  });

  it('collects the doc comments of documented cva variants only', () => {
    expect(docs.variants).toEqual(
      new Map([['fixtureVariants', new Map([['tone', '/** How loudly it reads. */']])]])
    );
  });

  it('keeps one props list when a declaration file is annotated twice', () => {
    const declarations = 'declare function Fixture(props: FixtureProps): null;\n';
    const twice = annotateDeclarations(annotateDeclarations(declarations, docs), docs);
    expect(twice.match(/\*\*Props\*\*/g)).toHaveLength(1);
  });
});

describe('annotateDeclarations', () => {
  const DECLARATIONS = [
    'declare const fixtureVariants: (props?: ({',
    '    tone?: "quiet" | "loud" | null | undefined;',
    '} & ClassProp) | undefined) => string;',
    '/**',
    ' * Shows a label.',
    ' *',
    ' * **Props**',
    ' * - `stale?: string`',
    ' */',
    'declare function Fixture(props: FixtureProps): null;',
    'declare function Plain(): null;',
    'export { Fixture, Plain as Renamed, fixtureVariants };',
    '',
  ].join('\n');

  const docs = {
    components: new Map([
      ['Fixture', '/**\n * Fresh.\n */'],
      ['Renamed', '/**\n * Renamed.\n */'],
    ]),
    variants: new Map([['fixtureVariants', new Map([['tone', '/** How loudly it reads. */']])]]),
  };

  it('replaces comments without reading them, follows renamed exports and restores variant comments', () => {
    expect(annotateDeclarations(DECLARATIONS, docs)).toBe(
      [
        'declare const fixtureVariants: (props?: ({',
        '    /** How loudly it reads. */',
        '    tone?: "quiet" | "loud" | null | undefined;',
        '} & ClassProp) | undefined) => string;',
        '/**',
        ' * Fresh.',
        ' */',
        'declare function Fixture(props: FixtureProps): null;',
        '/**',
        ' * Renamed.',
        ' */',
        'declare function Plain(): null;',
        'export { Fixture, Plain as Renamed, fixtureVariants };',
        '',
      ].join('\n')
    );
  });

  it('changes nothing when run over its own output', () => {
    const once = annotateDeclarations(DECLARATIONS, docs);
    expect(annotateDeclarations(once, docs)).toBe(once);
  });

  it('leaves a variant comment that is already there', () => {
    const documented = DECLARATIONS.replace('    tone?:', '    /** Already here. */\n    tone?:');
    const annotated = annotateDeclarations(documented, docs);
    expect(annotated).toContain('/** Already here. */');
    expect(annotated).not.toContain('How loudly it reads.');
  });
});
