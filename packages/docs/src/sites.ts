/** A docs site in the sidebar card's switcher. */
export interface DocsSite {
  /** Must equal that site's own `title`: the card marks the current site by it. */
  title: string;
  /** The site's home page, a full address. */
  href: string;
  /** What the product does, in one line. Without it the menu shows the address. */
  description?: string;
}

/** Every EQTY Lab docs site, in menu order. A new entry reaches a site when it upgrades. */
export const eqtyDocsSites: DocsSite[] = [
  {
    title: 'Equality',
    href: 'https://equality.eqtylab.io/',
    description: 'A theme-driven component library for EQTY Lab projects',
  },
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
    description: 'Verifiable builds and confidential workloads with hardware-rooted attestation',
  },
];
