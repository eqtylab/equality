import { highlightAll } from 'microlighter';

/**
 * Marks a `<pre>` as a block the highlighter should scan. `CodeBlock` sets it; put it on your own
 * `<pre>` to opt a custom code view into the same pass. The palette lives in `CodeBlock`'s
 * stylesheet, so import the component somewhere too.
 */
export const CODE_BLOCK_ATTRIBUTE = 'data-equality-code-block';

const SELECTOR = `pre[${CODE_BLOCK_ATTRIBUTE}] > code`;

let tail: Promise<void> = Promise.resolve();
const queued = new Map<Node, Promise<void>>();

const isSupported = () =>
  typeof window !== 'undefined' && typeof CSS !== 'undefined' && Boolean(CSS.highlights);

/**
 * Queue a rescan of every code block in `root`, coalescing a frame's worth of mounts into one pass.
 *
 * `root` is the tree the block lives in, as `pre.getRootNode()` returns it, and defaults to the
 * document. Blocks are found by querying that tree, and a query never crosses a shadow boundary,
 * so a block inside a shadow root is only found by passing its root. Scanning is tree-wide rather
 * than per block because each pass replaces the ranges the previous one registered, so a per-block
 * call would erase the other blocks.
 *
 * The highlighter forgets every range it registered on each pass, whatever tree it scanned, so a
 * pass on a shadow root clears the document's blocks and the reverse; the two cannot both stay
 * highlighted until upstream scopes that to the scanned tree.
 *
 * Passes are serialized. `highlightAll` collects its elements before awaiting their grammars and
 * clears the registered ranges once they land, so overlapping passes let the slower one finish
 * last and wipe the blocks it was too early to see.
 */
export const scheduleHighlight = (root?: Node): Promise<void> => {
  if (!isSupported()) return Promise.resolve();

  const tree = root ?? document;
  const pending = queued.get(tree);
  if (pending) return pending;

  const pass = tail.then(
    () =>
      new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => {
          queued.delete(tree);
          highlightAll({ root: tree as ParentNode, selector: SELECTOR }).then(
            () => resolve(),
            () => resolve()
          );
        });
      })
  );

  queued.set(tree, pass);
  tail = pass;

  return pass;
};
