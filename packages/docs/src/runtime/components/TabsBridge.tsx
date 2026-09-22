/**
 * Equality's `Tabs`, server-rendered with no client React.
 *
 * This exists as a React component, rather than as markup in `Tabs.astro`, because the whole
 * Radix tree has to render inside one root: its context does not survive an Astro component
 * boundary, which is why `TableBridge` can get away with a plain `<slot />` and this cannot.
 */
import { Tabs } from '@eqtylab/equality';

export interface TabsBridgeItem {
  label: string;
  value: string;
  icon?: string;
  /** Panel body, already rendered by `Astro.slots.render`. */
  html: string;
}

interface Props {
  id: string;
  items: TabsBridgeItem[];
}

export default function TabsBridge({ id, items }: Props) {
  return (
    <Tabs
      id={id}
      /* Mounts every panel and puts the indicator in every trigger, so `eq-tabs.ts` can
         switch tabs by flipping `data-state` with no React on the page. */
      staticRender
      items={items.map(({ label, value, icon, html }) => ({
        label,
        value,
        icon,
        /* `eq-tabs.ts` pairs synced sets by label; reading it off the trigger's text would
           break as soon as a tab carries an icon or a suffix. */
        triggerProps: { 'data-eq-tab-label': label },
        content: <div dangerouslySetInnerHTML={{ __html: html }} />,
      }))}
    />
  );
}
