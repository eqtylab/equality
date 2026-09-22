import { useState, type ComponentPropsWithoutRef } from 'react';
import { motion } from 'motion/react';

import { Icon } from '@/components/icon/icon';
import {
  TabsContainer,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/tabs/tabs-components';
import styles from '@/components/tabs/tabs.module.css';
import { cn } from '@/lib/utils';

interface TabsProps {
  id: string;
  items: {
    label: string;
    value: string;
    icon?: React.ReactElement | string;
    suffix?: React.ReactNode;
    content: React.ReactNode;
    /* The `data-` signature is required: React allows data attributes in JSX but not in a
       standalone typed object, forwarding without one is a type error. */
    triggerProps?: Omit<ComponentPropsWithoutRef<typeof TabsTrigger>, 'value'> & {
      [key: `data-${string}`]: string | number | boolean | undefined;
    };
  }[];
  className?: string;
  tabsListBackground?: 'transparent' | 'filled';
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  // Render for an environment where React never runs on the client (statically rendered sites).
  staticRender?: boolean;
}

const Tabs = ({
  id,
  items,
  className,
  tabsListBackground = 'transparent',
  defaultValue,
  onValueChange,
  staticRender = false,
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue ?? items[0].value);

  const isFilled = tabsListBackground === 'filled';

  const handleValueChange = (newTab: string) => {
    setActiveTab(newTab);
    onValueChange?.(newTab);
  };

  const renderIcon = (icon?: React.ReactElement | string) => {
    if (icon) {
      return <Icon icon={icon} size="sm" className={styles['tabs-icon']} />;
    }
    return null;
  };

  const indicatorClass = cn(
    styles['active-tab-indicator'],
    isFilled ? styles['active-tab-indicator--filled'] : styles['active-tab-indicator--transparent']
  );

  const renderActiveStyle = (isActive: boolean) => {
    /*
      Static mode has no React on the page, so switching tabs is an attribute flip: the
      indicator has to ship in every trigger and be revealed by `data-state`. No `layoutId`
      here either - motion treats duplicate ids as one shared element.
    */
    if (staticRender) {
      return <span className={cn(indicatorClass, styles['active-tab-indicator--static'])} />;
    }
    if (isActive) {
      return (
        <motion.span
          className={indicatorClass}
          initial={false}
          layoutId={`${id}-active-tab-indicator`}
        />
      );
    }
    return null;
  };

  return (
    <TabsContainer
      value={activeTab}
      onValueChange={handleValueChange}
      className={cn(styles['tabs'], className)}
    >
      <TabsList
        className={cn(
          styles['tabs-list'],
          isFilled ? styles['tabs-list--filled'] : styles['tabs-list--transparent']
        )}
      >
        {items.map(({ label, value, icon, suffix, triggerProps }) => {
          const isActive = activeTab === value;

          return (
            <TabsTrigger
              {...triggerProps}
              key={value}
              value={value}
              className={cn(
                styles['tabs-trigger'],
                isFilled ? styles['tabs-trigger--filled'] : styles['tabs-trigger--transparent'],
                triggerProps?.className
              )}
            >
              {renderIcon(icon)}
              {label}
              {suffix}
              {renderActiveStyle(isActive)}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {items.map(({ value, content }) => (
        <TabsContent
          value={value}
          key={value}
          className={styles['content']}
          /* Radix is `present={forceMount || isSelected}`, so without this an inactive panel
             is absent from the HTML entirely. CSS hides it instead; see tabs.module.css. */
          forceMount={staticRender || undefined}
        >
          {content}
        </TabsContent>
      ))}
    </TabsContainer>
  );
};

export { Tabs };
