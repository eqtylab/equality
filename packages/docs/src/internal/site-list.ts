import type { DocsConfig } from '../config.ts';
import { eqtyDocsSites, type DocsSite } from '../sites.ts';
import type { SiteMenuRow } from '../types.ts';

export function siteAddress(href: string): string {
  const url = new URL(href);
  return `${url.host}${url.pathname}`.replace(/\/$/, '');
}

/**
 * The sidebar card's menu: the public sites, with this site first when it isn't one of them.
 * `null`: the card is a plain label. `address` is Astro's `site`.
 */
export function siteMenu(
  cfg: Pick<DocsConfig, 'title' | 'description'>,
  address: string | undefined,
  shared: DocsSite[] = eqtyDocsSites
): SiteMenuRow[] | null {
  // The address catches a public site whose `title` has drifted from its entry, which would
  // otherwise list it twice: once as this site, once as someone else.
  const isThisSite = (site: DocsSite) =>
    site.title === cfg.title || (!!address && siteAddress(site.href) === siteAddress(address));
  const sites = shared.some(isThisSite)
    ? shared
    : [{ title: cfg.title, href: address ?? '/' }, ...shared];
  if (sites.length < 2) return null;
  return sites.map((site) => {
    const current = isThisSite(site);
    const description = site.description ?? (current ? cfg.description : undefined);
    return {
      title: site.title,
      href: site.href,
      detail: description ?? (URL.canParse(site.href) ? siteAddress(site.href) : ''),
      detailIsAddress: !description,
      current,
    };
  });
}
