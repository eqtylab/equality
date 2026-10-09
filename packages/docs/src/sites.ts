/** A docs site in the sidebar card's switcher. */
export interface DocsSite {
  /**
   * Should equal that site's own `title`. A site whose title drifts is still matched by its
   * Astro `site` address, but only if that equals `href`.
   */
  title: string;
  /** The site's home page, a full address. */
  href: string;
  /** What the product does, in one line. Without it the menu shows the address. */
  description?: string;
}

/**
 * EQTY Lab's public docs sites, in menu order. A new entry reaches a site when it upgrades.
 * This package is public: a private site stays off this list. It still gets the menu, with
 * itself at the top.
 */
export const eqtyDocsSites: DocsSite[] = [
  {
    title: 'Guardian',
    href: 'https://guardian.docs.eqtylab.io/',
    description: 'User guide, API, and deployment documentation',
  },
  {
    title: 'Integrity Python SDK',
    href: 'https://integrity-py.docs.eqtylab.io/',
    description: 'Track data provenance and computation integrity',
  },
  {
    title: 'Verifiable Compute',
    href: 'https://vcomp.docs.eqtylab.io/',
    description: 'Verifiable builds and confidential workloads',
  },
];
