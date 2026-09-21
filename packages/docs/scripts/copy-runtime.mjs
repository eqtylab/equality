// Build step: mirror src/runtime into dist/runtime. Dev watches via scripts/dev.mjs.
import { sync } from './runtime-sync.mjs';

await sync();
console.log('[docs] runtime synced');
