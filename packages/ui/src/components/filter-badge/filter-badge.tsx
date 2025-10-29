import { X } from 'lucide-react';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import styles from '@/components/filter-badge/filter-badge.module.css';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/tooltip';
import { cn } from '@/lib/utils';

interface FilterBadgeProps {
  label: string;
  handleRemove: () => void;
  colors?: string;
  btnColors?: string;
}

const FilterBadge = ({ label, handleRemove, colors, btnColors }: FilterBadgeProps) => {
  const isTruncated = label.length > 50;
  const displayLabel = isTruncated ? label.slice(0, 50) + '...' : label;

  const handlePointerDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Badge className={cn(styles['filters-badge'], colors ?? styles['filters-badge--colors'])}>
      {isTruncated ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{displayLabel}</TooltipTrigger>
            <TooltipContent className={styles['tooltip']}>{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        displayLabel
      )}
      <Button
        variant="outline"
        size="sm"
        onPointerDown={handlePointerDown}
        onClick={handleRemove}
        className={cn(styles['remove-btn'], btnColors)}
      >
        <X />
      </Button>
    </Badge>
  );
};

export default FilterBadge;
