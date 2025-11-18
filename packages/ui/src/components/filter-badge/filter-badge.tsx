import * as React from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/badge/badge';
import { Button } from '@/components/button/button';
import styles from '@/components/filter-badge/filter-badge.module.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

const XIcon = X as React.ComponentType<{ className?: string }>;

interface FilterBadgeProps {
  label: string;
  handleRemove: () => void;
  badgeClassName?: string;
  btnClassName?: string;
}

const FilterBadge = ({ label, handleRemove, badgeClassName, btnClassName }: FilterBadgeProps) => {
  const isTruncated = label.length > 50;
  const displayLabel = isTruncated ? label.slice(0, 50) + '...' : label;

  const handlePointerDown = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Badge className={cn(styles['filters-badge'], badgeClassName)}>
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
        variant="tertiary"
        size="sm"
        onPointerDown={handlePointerDown}
        onClick={handleRemove}
        className={cn(styles['remove-btn'], btnClassName)}
      >
        <XIcon />
      </Button>
    </Badge>
  );
};

export { FilterBadge };
