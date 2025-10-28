import type { ReactNode } from 'react';

import { cn } from '../lib/utils';
import { Button } from './button/button';

interface EmptyTableStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  showClearButton?: boolean;
  onClear?: () => void;
  className?: string;
}

export const EmptyTableState = ({
  icon,
  title,
  description,
  showClearButton = false,
  onClear,
  className,
}: EmptyTableStateProps) => {
  const showButton = showClearButton && onClear;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-1 text-center', className)}>
      <div className="text-foreground flex flex-col items-center gap-2">
        <div className="bg-foreground/10 mb-2 rounded-full p-3">
          <span className="*:size-5">{icon}</span>
        </div>
        <span className="text-sm font-medium">{title}</span>
      </div>

      {description && <span className="text-muted-foreground text-sm">{description}</span>}

      {showButton && (
        <Button variant="outline" size="sm" onClick={onClear} className="mt-2">
          Clear Filters
        </Button>
      )}
    </div>
  );
};
