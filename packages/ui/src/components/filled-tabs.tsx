import { motion } from 'framer-motion';

import { cn } from '../lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

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
    <Tabs value={activeTab} onValueChange={handleValueChange} className={cn('w-full', className)}>
      <TabsList className="relative w-full overflow-hidden rounded-md bg-white/10 p-1">
        {items.map(({ label, value, icon: Icon }) => {
          const isActive = activeTab === value;

          return (
            <TabsTrigger
              key={value}
              value={value}
              className="text-muted-foreground relative z-10 flex w-full gap-2 border-r border-b-0 border-white/10 px-3 py-1.5 text-sm font-medium last:border-r-0 data-[state=active]:border-transparent data-[state=active]:text-black"
              data-tour={`${value}-tab-overview`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {isActive && (
                <motion.span
                  className="bg-medium-lilac absolute inset-0 -z-1 h-full w-full rounded-sm"
                  initial={false}
                  layoutId="filled-tabs-tab"
                />
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {items.map(({ value, content }) => (
        <TabsContent value={value} key={value} className="mt-5 space-y-6">
          {content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export { FilledTabs };
