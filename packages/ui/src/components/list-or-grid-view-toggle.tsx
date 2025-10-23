import { Grid3X3, List } from 'lucide-react';

import { cn } from '../lib/utils';
import { IconButton } from './icon-button';

export type ViewMode = 'grid' | 'list';

interface ListOrGridViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ListOrGridViewToggle = ({
  viewMode,
  onViewModeChange,
  className,
}: ListOrGridViewToggleProps) => {
  const isGridView = viewMode === 'grid';
  const isListView = viewMode === 'list';

  const handleGridClick = () => {
    onViewModeChange('grid');
  };

  const handleListClick = () => {
    onViewModeChange('list');
  };

  return (
    <div className={cn('border-lilac/10 overflow-hidden rounded-md border', className)}>
      <div className="flex">
        <IconButton
          size="sm"
          name="Grid3X3"
          className={cn(
            'rounded-none border-0',
            isGridView
              ? 'bg-lilac/10 text-lilac'
              : 'bg-background/50 text-muted-foreground hover:text-foreground'
          )}
          onClick={handleGridClick}
        ></IconButton>
        <IconButton
          size="sm"
          name="List"
          className={cn(
            'rounded-none border-0',
            isListView
              ? 'bg-lilac/10 text-lilac'
              : 'bg-background/50 text-muted-foreground hover:text-foreground'
          )}
          onClick={handleListClick}
        ></IconButton>
      </div>
    </div>
  );
};
