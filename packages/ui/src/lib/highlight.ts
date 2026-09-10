import { highlightAll } from 'microlighter';

/**
 * Marks a `<pre>` as a block the highlighter should scan. `CodeBlock` sets it; put it on your own
 * `<pre>` to opt a custom code view into the same pass. The palette lives in `CodeBlock`'s
 * stylesheet, so import the component somewhere too.
 */
export const CODE_BLOCK_ATTRIBUTE = 'data-equality-code-block';

const SELECTOR = `pre[${CODE_BLOCK_ATTRIBUTE}] > code`;

let scheduled: Promise<void> | null = null;

const isSupported = () =>
  typeof window !== 'undefined' && typeof CSS !== 'undefined' && Boolean(CSS.highlights);

/**
 * Queue a rescan of every mounted code block, coalescing a frame's worth of mounts into one pass.
 *
 * Scanning is document-wide by necessity: each `highlightAll` clears the ranges the last one
 * registered, so a per-block call would erase every other block on the page. Blocks inside a
 * shadow root are out of reach.
 */
export const scheduleHighlight = (): Promise<void> => {
  if (!isSupported()) return Promise.resolve();
  if (scheduled) return scheduled;

  scheduled = new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      scheduled = null;
      highlightAll({ selector: SELECTOR }).then(
        () => resolve(),
        () => resolve()
      );
    });
  });

  return scheduled;
};
