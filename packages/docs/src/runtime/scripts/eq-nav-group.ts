/**
 * Animates a navigation group open and closed, on top of `<details>`.
 *
 * Do not swap this for Equality's `MotionCollapsibleContent`. It measures after mount
 * and animates up from zero, so a group that starts open expands on every page load.
 *
 * Duration and easing are that component's, so the motion still matches.
 */
const DURATION = 300;
const EASING = 'ease-in-out';

function wire(group: HTMLDetailsElement) {
  const summary = group.querySelector('summary');
  const panel = summary?.nextElementSibling;
  if (!summary || !(panel instanceof HTMLElement)) return;

  let running: Animation | null = null;

  summary.addEventListener('click', (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // The browser would toggle `open` immediately; the close has to outlive that.
    event.preventDefault();
    running?.cancel();

    const opening = !group.open;
    // Measured while open in both directions, so interrupting mid-animation does not
    // snap to a stale height.
    if (opening) group.open = true;
    const height = panel.scrollHeight;
    const from = opening ? 0 : panel.getBoundingClientRect().height;

    panel.style.overflow = 'hidden';
    running = panel.animate(
      {
        height: [`${from}px`, `${opening ? height : 0}px`],
        opacity: [opening ? 0 : 1, opening ? 1 : 0],
      },
      { duration: DURATION, easing: EASING }
    );

    running.onfinish = () => {
      running = null;
      panel.style.removeProperty('overflow');
      if (!opening) group.open = false;
    };
  });
}

for (const group of document.querySelectorAll<HTMLDetailsElement>('details[data-eq-nav-group]')) {
  wire(group);
}
