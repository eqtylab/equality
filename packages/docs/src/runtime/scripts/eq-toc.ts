/**
 * Scroll-spy for the table of contents, and the lit segment of its rail.
 *
 * Do not swap this for an IntersectionObserver band. A band leaves nothing active at
 * load, and nothing between two headings.
 *
 * The segment is a dash on a path tracing the whole rail, elbows included, so it
 * travels through corners. Its numbers are path length, not pixels.
 */

/** Scaling by distance is what makes a corner take visible time. */
const MS_PER_PX = 8;
const MIN_MS = 220;
const MAX_MS = 520;
const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

interface Span {
  start: number;
  length: number;
}

function measureRail(root: HTMLElement, path: SVGPathElement) {
  const origin = root.getBoundingClientRect();
  const spans = new Map<string, Span>();
  const parts: string[] = [];
  let cursor = 0;

  const rows = root.querySelectorAll<HTMLElement>('a[data-slug], [data-eq-elbow]');
  for (const row of rows) {
    const box = row.getBoundingClientRect();
    const top = box.top - origin.top;
    const bottom = box.bottom - origin.top;
    const direction = row.getAttribute('data-eq-elbow');

    if (direction) {
      const left = box.left - origin.left;
      const right = box.right - origin.left;
      const [from, to] = direction === 'in' ? [left, right] : [right, left];
      const mid = (top + bottom) / 2;
      if (parts.length === 0) parts.push(`M ${from} ${top}`);
      parts.push(`C ${from} ${mid}, ${to} ${mid}, ${to} ${bottom}`);
    } else {
      // The border's centre line, so the lit segment covers the grey one exactly.
      const x = box.left - origin.left + parseFloat(getComputedStyle(row).borderLeftWidth) / 2;
      if (parts.length === 0) parts.push(`M ${x} ${top}`);
      parts.push(`L ${x} ${bottom}`);
    }

    path.setAttribute('d', parts.join(' '));
    const end = path.getTotalLength();
    const slug = row.dataset.slug;
    if (!direction && slug) spans.set(slug, { start: cursor, length: end - cursor });
    cursor = end;
  }

  return { spans, total: cursor };
}

class EqToc extends HTMLElement {
  #teardown?: () => void;

  connectedCallback() {
    const slugs = (this.dataset.slugs ?? '').split(',').filter(Boolean);

    const links = new Map<string, HTMLAnchorElement>();
    for (const link of this.querySelectorAll<HTMLAnchorElement>('a[data-slug]')) {
      if (link.dataset.slug) links.set(link.dataset.slug, link);
    }

    const targets = slugs
      .map((slug) => document.getElementById(slug))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const path = this.querySelector<SVGPathElement>('[data-eq-toc-rail]');
    const rails = this.querySelector<HTMLElement>('[data-eq-toc-rails]');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    let spans = new Map<string, Span>();
    let total = 0;
    let previous: number | null = null;

    const remeasure = () => {
      if (!path || !rails) return;
      previous = null;
      ({ spans, total } = measureRail(rails, path));
    };

    const light = (slug: string) => {
      if (!path) return;
      const span = spans.get(slug);
      if (!span) return;

      if (previous === null || still.matches) {
        // No slide into the first position, and none under reduced motion.
        path.style.transition = 'none';
      } else {
        const ms = Math.min(
          MAX_MS,
          Math.max(MIN_MS, Math.round(Math.abs(span.start - previous) * MS_PER_PX))
        );
        path.style.transition = `stroke-dasharray ${ms}ms ${EASE}, stroke-dashoffset ${ms}ms ${EASE}`;
      }

      path.style.strokeDasharray = `${span.length} ${total}`;
      path.style.strokeDashoffset = `${-span.start}`;
      if (previous === null) {
        // Commit the jump before the fade, so the segment appears in place.
        void path.getBoundingClientRect();
        path.style.opacity = '1';
      }
      previous = span.start;
    };

    let frame = 0;
    const paint = () => {
      frame = 0;
      // Clicking a heading lands it 96px down (scroll-mt-24), so the line sits below.
      const line = window.innerHeight * 0.2;
      let active = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= line) active = target;
        else break;
      }
      for (const [slug, link] of links) {
        if (slug === active.id) {
          link.setAttribute('data-active', '');
          // `location` is the ARIA value for the current place within a set.
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('data-active');
          link.removeAttribute('aria-current');
        }
      }
      light(active.id);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(paint);
    };

    const onResize = () => {
      remeasure();
      schedule();
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    remeasure();
    paint();

    this.#teardown = () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }

  disconnectedCallback() {
    this.#teardown?.();
    this.#teardown = undefined;
  }
}

if (!customElements.get('eq-toc')) {
  customElements.define('eq-toc', EqToc);
}
