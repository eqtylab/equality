import { ElementType, useMemo } from 'react';

import { cn } from '../lib/utils';

interface ElementIconProps {
  iconUrl?: string;
  className?: string;
}

export const ElementIcon = ({ iconUrl, className }: ElementIconProps) => {
  const IconComponent = useMemo(() => {
    // Check if the icon is an SVG component (imported directly)
    if (typeof iconUrl === 'object' && (iconUrl as ElementType)) {
      return iconUrl as ElementType;
    }
    return null;
  }, [iconUrl]);

  // If no icon URL provided, return null
  if (!iconUrl) return null;

  // If we have a component, render it directly
  if (IconComponent) {
    return <IconComponent className={cn('h-full w-full', className)} />;
  }

  // Otherwise treat it as an image URL
  return (
    <div
      className={cn(
        'border-grey200 flex aspect-square w-10 min-w-10 overflow-hidden rounded-full border transition-all',
        !iconUrl && 'bg-white',
        className
      )}
    >
      {iconUrl && <img src={iconUrl} alt="" className="object-cover" />}
    </div>
  );
};

export default ElementIcon;
