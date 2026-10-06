import type { DocsConfig } from '@eqtylab/docs/config';

export type FooterRow = DocsConfig['footer']['links'][number];
export type PageFooterRow = FooterRow & { end: '' | '.'; external: boolean; plain?: string };

export function footerRowsFor(
  rows: FooterRow[],
  page: { editHref?: string; editIcon: string }
): PageFooterRow[] {
  const edit: FooterRow = {
    prefix: 'Spotted a mistake?',
    label: 'Edit this page',
    href: page.editHref,
    icon: page.editIcon,
    external: true,
  };
  const all = page.editHref ? [edit, ...rows] : rows;
  return all.map((row): PageFooterRow => {
    if (!row.href) {
      return {
        ...row,
        plain: [row.prefix, row.label].filter(Boolean).join(' '),
        end: '',
        external: false,
      };
    }
    return { ...row, end: /[.!?]$/.test(row.label) ? '' : '.', external: row.external ?? false };
  });
}
