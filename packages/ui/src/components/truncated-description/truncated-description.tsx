import { useState } from 'react';

import { Button } from '@/components/button/button';
import styles from '@/components/truncated-description/truncated-description.module.css';
import { cn } from '@/lib/utils';

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
    <div className={cn(styles['truncated-description'], className)}>
      <div dangerouslySetInnerHTML={{ __html: displayDescription }} />
      {isLongDescription && (
        <Button variant="link" size="sm" className={styles['show-btn']} onClick={handleToggle}>
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

export { TruncatedDescription };
