/**
 * Tab switching for server-rendered `<Tabs>`. Equality renders them with `staticRender`, so
 * every panel is already in the DOM and selecting one is a `data-state` flip - there is no
 * React on the page to do it. One delegated listener, so it survives view transitions.
 */
const STORAGE_PREFIX = 'eqty-docs-tabs:';

function setOf(node: Element | null): HTMLElement | null {
  return node?.closest<HTMLElement>('[data-eq-tabs]') ?? null;
}

function triggersIn(set: HTMLElement): HTMLElement[] {
  return Array.from(set.querySelectorAll<HTMLElement>('[role="tab"]'));
}

function panelFor(trigger: HTMLElement): HTMLElement | null {
  const id = trigger.getAttribute('aria-controls');
  return id ? document.getElementById(id) : null;
}

function select(set: HTMLElement, chosen: HTMLElement, focus = false): void {
  for (const trigger of triggersIn(set)) {
    const active = trigger === chosen;
    const state = active ? 'active' : 'inactive';
    trigger.setAttribute('aria-selected', String(active));
    trigger.setAttribute('data-state', state);
    // Roving tabindex: the strip is one tab stop, arrows move within it.
    trigger.tabIndex = active ? 0 : -1;
    panelFor(trigger)?.setAttribute('data-state', state);
  }
  if (focus) chosen.focus();
}

function labelOf(trigger: HTMLElement): string {
  return trigger.dataset.eqTabLabel ?? '';
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + key);
  } catch {
    return null;
  }
}

function write(key: string, label: string): void {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, label);
  } catch {
    // Storage denied; syncing still works for this page view.
  }
}

/** Every other set sharing the key follows. A set without that label is left alone. */
function sync(key: string, label: string, origin: HTMLElement | null): void {
  for (const set of document.querySelectorAll<HTMLElement>('[data-eq-tabs][data-sync-key]')) {
    if (set === origin || set.dataset.syncKey !== key) continue;
    const match = triggersIn(set).find((trigger) => labelOf(trigger) === label);
    if (match) select(set, match);
  }
}

function activate(set: HTMLElement, trigger: HTMLElement, focus = false): void {
  select(set, trigger, focus);
  const key = set.dataset.syncKey;
  if (!key) return;
  const label = labelOf(trigger);
  write(key, label);
  sync(key, label, set);
}

document.addEventListener('click', (event) => {
  const trigger = (event.target as Element | null)?.closest<HTMLElement>('[role="tab"]');
  const set = setOf(trigger ?? null);
  if (!trigger || !set) return;
  event.preventDefault();
  activate(set, trigger);
});

const MOVES: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

document.addEventListener('keydown', (event) => {
  const trigger = (event.target as Element | null)?.closest<HTMLElement>('[role="tab"]');
  const set = setOf(trigger ?? null);
  if (!trigger || !set) return;

  const triggers = triggersIn(set);
  const from = triggers.indexOf(trigger);
  if (from < 0) return;

  let to: number;
  if (event.key in MOVES) {
    to = (from + (MOVES[event.key] as number) + triggers.length) % triggers.length;
  } else if (event.key === 'Home') {
    to = 0;
  } else if (event.key === 'End') {
    to = triggers.length - 1;
  } else {
    return;
  }

  event.preventDefault();
  activate(set, triggers[to] as HTMLElement, true);
});

// Restore remembered choices. Runs after first paint, so a non-default choice visibly settles.
for (const set of document.querySelectorAll<HTMLElement>('[data-eq-tabs][data-sync-key]')) {
  const key = set.dataset.syncKey;
  if (!key) continue;
  const stored = read(key);
  if (!stored) continue;
  const match = triggersIn(set).find((trigger) => labelOf(trigger) === stored);
  if (match) select(set, match);
}
