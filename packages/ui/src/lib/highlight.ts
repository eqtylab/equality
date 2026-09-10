import { highlightAll } from 'microlighter';

/**
 * Marks a `<pre>` as a block the highlighter should scan. `CodeBlock` sets it; put it on your own
 * `<pre>` to opt a custom code view into the same pass. The palette lives in `CodeBlock`'s
 * stylesheet, so import the component somewhere too.
 */
export const CODE_BLOCK_ATTRIBUTE = 'data-equality-code-block';

const SELECTOR = `pre[${CODE_BLOCK_ATTRIBUTE}] > code`;

let tail: Promise<void> = Promise.resolve();
let queued: Promise<void> | null = null;

const isSupported = () =>
  typeof window !== 'undefined' && typeof CSS !== 'undefined' && Boolean(CSS.highlights);

/**
 * Queue a rescan of every mounted code block, coalescing a frame's worth of mounts into one pass.
 *
 * Scanning is document-wide by necessity: each `highlightAll` clears the ranges the last one
 * registered, so a per-block call would erase every other block on the page. Blocks inside a
 * shadow root are out of reach.
 *
 * Passes are serialized for the same reason. `highlightAll` collects its elements before awaiting
 * their grammars and clears every registered range once they land, so overlapping passes let the
 * slower one finish last and wipe the blocks it was too early to see.
 */
export const scheduleHighlight = (): Promise<void> => {
  if (!isSupported()) return Promise.resolve();
  if (queued) return queued;

  const pass = tail.then(
    () =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          queued = null;
          highlightAll({ selector: SELECTOR }).then(
            () => resolve(),
            () => resolve()
          );
        });
      })
  );

  queued = pass;
  tail = pass;

  return pass;
};
