import { X } from 'lucide-react';

import { cn } from '../lib/utils';
import { Badge } from './badge';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

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
    <Badge className={cn('flex items-center gap-1', colors ?? 'bg-lilac/20 text-lilac')}>
      {isTruncated ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{displayLabel}</TooltipTrigger>
            <TooltipContent className="max-w-xs break-words">{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        displayLabel
      )}
      <Button
        variant="ghost"
        size="sm"
        onPointerDown={handlePointerDown}
        onClick={handleRemove}
        className={cn('size-4 p-0 [&_svg]:size-3', btnColors)}
      >
        <X />
      </Button>
    </Badge>
  );
};

export default FilterBadge;
