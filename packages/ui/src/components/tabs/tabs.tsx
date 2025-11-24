import { useState } from 'react';
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
    content: React.ReactNode;
  }[];
  className?: string;
  tabsListBackground?: 'transparent' | 'filled';
}

const Tabs = ({ id, items, className, tabsListBackground = 'transparent' }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(items[0].value);

  const isFilled = tabsListBackground === 'filled';

  const handleValueChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  const renderIcon = (icon?: React.ReactElement | string) => {
    if (icon) {
      return <Icon icon={icon} size="sm" className={styles['tabs-icon']} />;
    }
    return null;
  };

  const renderActiveStyle = (isActive: boolean) => {
    if (isActive) {
      return (
        <motion.span
          className={cn(
            styles['active-tab-indicator'],
            isFilled
              ? styles['active-tab-indicator--filled']
              : styles['active-tab-indicator--transparent']
          )}
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
        {items.map(({ label, value, icon }) => {
          const isActive = activeTab === value;

          return (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                styles['tabs-trigger'],
                isFilled ? styles['tabs-trigger--filled'] : styles['tabs-trigger--transparent']
              )}
              data-tour={`${value}-tab-overview`}
            >
              {renderIcon(icon)}
              {label}
              {renderActiveStyle(isActive)}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {items.map(({ value, content }) => (
        <TabsContent value={value} key={value} className={styles['content']}>
          {content}
        </TabsContent>
      ))}
    </TabsContainer>
  );
};

export { Tabs };
