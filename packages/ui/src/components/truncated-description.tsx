import { useState } from 'react';

import { cn } from '../lib/utils';
import { Button } from './button';

interface TruncatedDescriptionProps {
  className?: string;
  description: string;
  maxLength?: number;
}

const TruncatedDescription = ({
  className,
  description,
  maxLength = 120,
}: TruncatedDescriptionProps) => {
  const plainText = removeHtmlTags(description);
  const isLongDescription = plainText.length > maxLength;
  const truncatedDescription = isLongDescription
    ? `${description.slice(0, maxLength)}...`
    : description;

  const [expanded, setExpanded] = useState(!isLongDescription);

  const displayDescription = expanded ? description : truncatedDescription;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className={cn('text-sm', className)}>
      <div dangerouslySetInnerHTML={{ __html: displayDescription }} />
      {isLongDescription && (
        <Button variant="link" size="sm" className="h-max p-0 text-xs" onClick={handleToggle}>
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  );
};

// Helper function
const removeHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export default TruncatedDescription;
