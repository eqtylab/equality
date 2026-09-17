/**
 * Starts highlighting for server-rendered code blocks, whose `useEffect` never
 * runs without hydration. A custom element so it survives view transitions.
 */
import { scheduleHighlight } from '@eqtylab/equality';

class EqHighlight extends HTMLElement {
  // Captured on connect: a detached element no longer knows its tree, and the rescan on removal drops stale ranges.
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
