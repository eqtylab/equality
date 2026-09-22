/** Exercises `clientScripts`: bundled, so a node_modules import has to resolve. */
import { scheduleHighlight } from '@eqtylab/equality';

document.documentElement.setAttribute(
  'data-fixture-client-script',
  String(typeof scheduleHighlight)
);
