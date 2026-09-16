/**
 * Starts syntax highlighting for a server-rendered code block.
 *
 * Equality's `CodeBlock` schedules its own highlight from a `useEffect`, which never runs for a
 * block rendered with no client: directive -- so without this the code renders and stays grey.
 *
 * Named for what it does rather than what it wraps, because the pass it starts is document-wide:
 * one element anywhere on the page highlights every block on it.
 *
 * A custom element on purpose, like eq-toc: connectedCallback fires on every DOM swap, so a
 * consumer that turns on view transitions keeps working with no lifecycle wiring to forget.
 * `scheduleHighlight` coalesces a frame's worth of calls per root, so a page of blocks is one pass.
 */
import { scheduleHighlight } from '@eqtylab/equality';

class EqHighlight extends HTMLElement {
  // Read up front: once the element is detached it no longer knows which tree it was in, and the
  // rescan on removal is what drops highlight ranges pointing at nodes that have gone.
  #root?: Node;

  connectedCallback() {
    this.#root = this.getRootNode();
    void scheduleHighlight(this.#root);
  }

  disconnectedCallback() {
    void scheduleHighlight(this.#root);
    this.#root = undefined;
  }
}

if (!customElements.get('eq-highlight')) {
  customElements.define('eq-highlight', EqHighlight);
}
