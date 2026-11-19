import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const ROOT = 'src/components';

const HAND_WRITTEN_HEIGHT =
  /(?<![\w-])(?:(?:min-h|h|size)-(?:6|7|8|9|9\.5|10|11|12|\[[\d.]+(?:px|rem)\])(?![\w.-])|(?:min-)?height:\s*[\d.]+(?:px|rem))/g;

const EXCEPTIONS: Record<string, string> = {
  'avatar/avatar.module.css': 'A picture, not a control',
  'bar-graph/bar-graph.module.css': 'A graph, not a control',
  'date-range-picker/date-range-picker.module.css': 'A grid of days, not a row of controls',
  'icon/icon.module.css': 'A picture, not a control',
  'loading-overlay/loading-overlay.module.css': 'A picture, not a control',
  'page-not-found/page-not-found.module.css': 'A page illustration',
  'progress-indicator/progress-indicator.module.css': 'Not a control',
  'spinner/spinner.module.css': 'A picture, not a control',
  'switch/switch.module.css': 'Its own shape, not a text control',
};

let found: Map<string, string[]>;

beforeAll(async () => {
  const entries = await readdir(ROOT, { recursive: true });
  const files = entries.filter((entry) => entry.endsWith('.css')).sort();
  found = new Map();
  await Promise.all(
    files.map(async (file) => {
      const lines = (await readFile(path.join(ROOT, file), 'utf8')).split('\n');
      const hits = lines.flatMap((line, index) =>
        [...line.matchAll(HAND_WRITTEN_HEIGHT)].map((match) => `${file}:${index + 1} ${match[0]}`)
      );
      if (hits.length > 0) found.set(file.split(path.sep).join('/'), hits);
    })
  );
});

describe('control heights', () => {
  it('come from an --eq-control-*-height name, never a height written by hand', () => {
    const offenders = [...found]
      .filter(([file]) => !(file in EXCEPTIONS))
      .flatMap(([, hits]) => hits)
      .sort();
    expect(offenders).toEqual([]);
  });

  it('lists no exception that no longer writes a height by hand', () => {
    const stale = Object.keys(EXCEPTIONS).filter((file) => !found.has(file));
    expect(stale).toEqual([]);
  });
});
