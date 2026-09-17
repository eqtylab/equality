/** Copy-to-clipboard for static code fences. One delegated listener, so it survives view transitions. */
const COPIED_MS = 1600;

function findFence(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>('[data-eq-copy]');
}

document.addEventListener('click', async (event) => {
  const trigger = (event.target as Element | null)?.closest('button');
  if (!trigger) return;

  const fence = findFence(trigger);
  if (!fence) return;

  const code = fence.dataset.eqCopy;
  if (!code) return;

  event.preventDefault();
  try {
    await navigator.clipboard.writeText(code);
    fence.setAttribute('data-copied', '');
    window.setTimeout(() => fence.removeAttribute('data-copied'), COPIED_MS);
  } catch {
    // Clipboard denied; do not show a success state.
  }
});
