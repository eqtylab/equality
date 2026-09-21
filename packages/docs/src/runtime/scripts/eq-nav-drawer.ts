/**
 * With no script the Popover API opens and closes the drawer, shuts it on Escape or a
 * click outside, and paints it above everything else. Two things it does not give,
 * both verified in the browser suite rather than assumed:
 *
 * 1. `aria-expanded` on the invoker. No engine adds it, so a screen reader hears a
 *    button with no disclosure state.
 * 2. Focus return on dismiss in WebKit. Chromium restores focus to the invoker;
 *    desktop Safari, mobile Safari and iPad all leave it on `<body>`, which strands a
 *    keyboard user exactly the way `DialogContainer` does. See equality-dialog-repair.
 *
 * Both are reflected off the `toggle` event so they track every dismissal path,
 * rather than being set once and going stale.
 */
const drawer = document.getElementById('eq-nav-drawer');
const trigger = document.querySelector<HTMLElement>('[popovertarget="eq-nav-drawer"]');

if (drawer && trigger) {
  trigger.setAttribute('aria-expanded', 'false');

  drawer.addEventListener('toggle', (event) => {
    const open = (event as ToggleEvent).newState === 'open';
    trigger.setAttribute('aria-expanded', String(open));

    // Only when the engine left focus nowhere. Clicking a link inside the drawer
    // navigates away, and light-dismissing onto another control should keep it.
    if (!open && document.activeElement === document.body) {
      trigger.focus();
    }
  });
}
