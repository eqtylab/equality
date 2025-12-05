import { IconButton } from '@/components/icon-button/icon-button';
import styles from '@/components/list-or-grid-view-toggle/list-or-grid-view-toggle.module.css';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ListOrGridViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  order: ['grid', 'list'] | ['list', 'grid'];
  className?: string;
}

const ListOrGridViewToggle = ({
  viewMode,
  onViewModeChange,
  order = ['grid', 'list'],
  className,
}: ListOrGridViewToggleProps) => {
  const handleGridClick = () => {
    onViewModeChange('grid');
  };

  const handleListClick = () => {
    onViewModeChange('list');
  };

  return (
    <div className={cn(styles['list-or-grid-view-toggle'], className)}>
      {order.map((mode) => {
        const currentlyActive = mode === viewMode;
        return (
          <IconButton
            key={mode}
            size="sm"
            name={mode === 'grid' ? 'Grid3X3' : 'List'}
            className={cn(
              styles['icon-button'],
              currentlyActive ? styles['icon-button--active'] : styles['icon-button--inactive']
            )}
            onClick={mode === 'grid' ? handleGridClick : handleListClick}
          ></IconButton>
        );
      })}
    </div>
  );
};

export { ListOrGridViewToggle };
