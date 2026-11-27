import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const packageRoot = path.resolve(__dirname, '..');

const runPlainNode = (args: string[]) =>
  execFileSync(process.execPath, args, {
    cwd: packageRoot,
    encoding: 'utf8',
    env: { PATH: process.env.PATH ?? '' },
  }).trim();

describe('@eqtylab/equality/cn in plain Node', () => {
  it('is built', () => {
    expect(
      existsSync(path.join(packageRoot, 'dist/lib/cn.js')),
      'run `pnpm build` in packages/ui first'
    ).toBe(true);
  });

  it('imports as ESM with no CSS handling and keeps a text style beside a colour', () => {
    const out = runPlainNode([
      '--input-type=module',
      '-e',
      "import { cn } from '@eqtylab/equality/cn'; console.log(cn('text-display', 'text-text-secondary'));",
    ]);
    expect(out).toBe('text-display text-text-secondary');
  });

  it('requires as CommonJS with no CSS handling', () => {
    const out = runPlainNode([
      '-e',
      "const { cn } = require('@eqtylab/equality/cn'); console.log(cn('size-4', 'size-(--eq-size-sm)'));",
    ]);
    expect(out).toBe('size-(--eq-size-sm)');
  });
});
