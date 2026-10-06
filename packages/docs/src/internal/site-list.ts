import type { DocsConfig } from '../config.ts';
import { eqtyDocsSites, type DocsSite } from '../sites.ts';
import type { SiteMenuRow } from '../types.ts';

export interface SiteMenu {
  /** `null`: the card is a plain label. */
  rows: SiteMenuRow[] | null;
  warning?: string;
}

export function siteAddress(href: string): string {
  const url = new URL(href);
  return `${url.host}${url.pathname}`.replace(/\/$/, '');
}

export function siteMenu(
  cfg: Pick<DocsConfig, 'title' | 'description' | 'sites'>,
  shared: DocsSite[] = eqtyDocsSites
): SiteMenu {
  if (cfg.sites === false) return { rows: null };
  const sites = cfg.sites ?? shared;
  // Only the shared list can get here without a match: config validation rejects a custom one.
  if (!sites.some((site) => site.title === cfg.title)) {
    return {
      rows: null,
      warning:
        `"${cfg.title}" is not in the EQTY Lab docs list, so the sidebar shows no site switcher. ` +
        `Add it to eqtyDocsSites in @eqtylab/docs, or set sites: false.`,
    };
  }
  if (sites.length < 2) return { rows: null };
  return {
    rows: sites.map((site) => {
      const current = site.title === cfg.title;
      const description = site.description ?? (current ? cfg.description : undefined);
      return {
        title: site.title,
        href: site.href,
        detail: description ?? siteAddress(site.href),
        detailIsAddress: !description,
        current,
      };
    }),
  };
}
