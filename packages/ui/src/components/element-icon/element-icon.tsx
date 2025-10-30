import { ElementType, useMemo } from 'react';

import styles from '@/components/element-icon/element-icon.module.css';
import { cn } from '@/lib/utils';

interface ElementIconProps {
  iconUrl?: string;
  className?: string;
}

const ElementIcon = ({ iconUrl, className }: ElementIconProps) => {
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
    return <IconComponent className={cn(styles['icon'], className)} />;
  }

  // Otherwise treat it as an image URL
  return (
    <div
      className={cn(
        styles['element-icon'],
        !iconUrl && styles['element-icon--background'],
        className
      )}
    >
      {iconUrl && <img src={iconUrl} alt="" className={styles['image']} />}
    </div>
  );
};

export { ElementIcon };
