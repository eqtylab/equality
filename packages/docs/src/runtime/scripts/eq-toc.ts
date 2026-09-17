/** Scroll-spy for the table of contents. A custom element so the observer is torn down across view transitions. */
class EqToc extends HTMLElement {
  #observer?: IntersectionObserver;

  connectedCallback() {
    const slugs = (this.dataset.slugs ?? '').split(',').filter(Boolean);
    if (slugs.length === 0) return;

    const links = new Map<string, HTMLAnchorElement>();
    for (const link of this.querySelectorAll<HTMLAnchorElement>('a[data-slug]')) {
      const slug = link.dataset.slug;
      if (slug) links.set(slug, link);
    }

    const targets = slugs
      .map((slug) => document.getElementById(slug))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    const visible = new Set<string>();

    const paint = () => {
      // Topmost visible heading wins.
      let active: string | undefined;
      for (const slug of slugs) {
        if (visible.has(slug)) {
          active = slug;
          break;
        }
      }
      for (const [slug, link] of links) {
        if (slug === active) link.setAttribute('data-active', '');
        else link.removeAttribute('data-active');
      }
    };

    this.#observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visible.add(id);
          else visible.delete(id);
        }
        paint();
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    for (const target of targets) this.#observer.observe(target);
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = undefined;
  }
}

if (!customElements.get('eq-toc')) {
  customElements.define('eq-toc', EqToc);
}
