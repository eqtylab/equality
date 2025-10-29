import { IconButton } from '@/components/icon-button/icon-button';
import styles from '@/components/list-or-grid-view-toggle/list-or-grid-view-toggle.module.css';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ListOrGridViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

const ListOrGridViewToggle = ({
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
    <div className={cn(styles['list-or-grid-view-toggle'], className)}>
      <IconButton
        size="sm"
        name="Grid3X3"
        className={cn(
          styles['icon-button'],
          isGridView ? styles['icon-button--active'] : styles['icon-button--inactive']
        )}
        onClick={handleGridClick}
      ></IconButton>
      <IconButton
        size="sm"
        name="List"
        className={cn(
          styles['icon-button'],
          isListView ? styles['icon-button--active'] : styles['icon-button--inactive']
        )}
        onClick={handleListClick}
      ></IconButton>
    </div>
  );
};

export { ListOrGridViewToggle };
