import * as React from 'react';
import { AlertOctagon, Home } from 'lucide-react';

import { Button } from '@/components/button/button';
import styles from '@/components/page-not-found/page-not-found.module.css';
import { cn } from '@/lib/utils';

const OctagonAlert = AlertOctagon as React.ComponentType<{ className?: string }>;
const HomeIcon = Home as React.ComponentType<{ className?: string }>;

interface NotFoundProps {
  className?: string;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
}

const NotFound = ({
  className,
  title = 'Oops! Page Not Found',
  description = "The page or resource you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
  onHomeClick = () => (window.location.href = '/'),
}: NotFoundProps) => {
  return (
    <div className={cn(styles['page-not-found'], className)}>
      <div className={styles['page-not-found-inner']}>
        {/* Icon */}
        <div className={styles['icon-container']}>
          <OctagonAlert className={styles['alert-icon']} />
        </div>

        {/* Title */}
        <h1 className={styles['title']}>{title}</h1>

        {/* Description */}
        <p className={styles['description']}>{description}</p>

        {/* Actions */}
        <div className={styles['actions']}>
          {showHomeButton && (
            <Button onClick={onHomeClick} variant="secondary">
              <HomeIcon className={styles['home-icon']} />
              Return Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export { NotFound };
