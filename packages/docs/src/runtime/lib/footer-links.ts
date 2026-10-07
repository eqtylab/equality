import type { DocsConfig } from '@eqtylab/docs/config';

export type FooterRow = DocsConfig['footer']['links'][number];
export type PageFooterRow = FooterRow & { external: boolean; plain?: string };

export function footerRowsFor(rows: FooterRow[]): PageFooterRow[] {
  return rows.map((row): PageFooterRow => {
    if (!row.href) {
      return {
        ...row,
        plain: [row.prefix, row.label].filter(Boolean).join(' '),
        external: false,
      };
    }
    return { ...row, external: row.external ?? false };
  });
}

export function articleRowsFor(page: {
  editHref?: string;
  editIcon: string;
  issueHref?: string;
  issueIcon: string;
}): PageFooterRow[] {
  const rows: FooterRow[] = [];
  if (page.editHref) {
    rows.push({
      prefix: 'Spotted a mistake?',
      label: 'Edit this page',
      href: page.editHref,
      icon: page.editIcon,
      external: true,
    });
  }
  if (page.issueHref) {
    rows.push({
      prefix: 'Something broken?',
      label: 'Report an issue',
      href: page.issueHref,
      icon: page.issueIcon,
      external: true,
    });
  }
  return footerRowsFor(rows);
}
