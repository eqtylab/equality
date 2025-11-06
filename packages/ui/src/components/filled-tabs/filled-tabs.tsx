import { motion } from 'motion/react';

import styles from '@/components/filled-tabs/filled-tabs.module.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs/tabs';
import { cn } from '@/lib/utils';

interface FilledTabsProps {
  activeTab: string;
  onValueChange: (value: string) => void;
  items: {
    label: string;
    value: string;
    icon: React.ElementType;
    content: React.ReactNode;
  }[];
  className?: string;
}

const FilledTabs = ({ items, onValueChange, activeTab, className }: FilledTabsProps) => {
  const handleValueChange = (newTab: string) => {
    onValueChange(newTab);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleValueChange}
      className={cn(styles['tabs'], className)}
    >
      <TabsList className={styles['tabs-list']}>
        {items.map(({ label, value, icon: Icon }) => {
          const isActive = activeTab === value;

          return (
            <TabsTrigger
              key={value}
              value={value}
              className={styles['tabs-trigger']}
              data-tour={`${value}-tab-overview`}
            >
              <Icon className={styles['icon']} />
              {label}
              {isActive && (
                <motion.span
                  className={styles['active-tab-indicator']}
                  initial={false}
                  layoutId="filled-tabs-tab"
                />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {items.map(({ value, content }) => (
        <TabsContent value={value} key={value} className={styles['content']}>
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export { FilledTabs };
