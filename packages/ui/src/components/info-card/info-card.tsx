import * as React from 'react';

import { Card, CardContent } from '@/components/card/card';
import { Icon } from '@/components/icon/icon';
import styles from '@/components/info-card/info-card.module.css';
import { Elevation, ELEVATION, getRelativeElevation } from '@/lib/elevations';

interface InfoCardProps {
  label: string;
  description: string | number | React.ReactNode;
  icon: React.ReactElement | string;
  className?: string;
  onClick?: () => void;
  elevation?: Elevation;
}

const InfoCard = ({
  label,
  description,
  icon,
  elevation = ELEVATION.RAISED,
  className,
  onClick,
  ...props
}: InfoCardProps) => {
  return (
    <Card className={className} onClick={onClick} elevation={elevation} {...props}>
      <CardContent>
        <div className={styles['info-card-content']}>
          <Icon
            icon={icon}
            size="sm"
            background="square"
            elevation={
              elevation === ELEVATION.SUNKEN ? ELEVATION.BASE : getRelativeElevation(elevation, -1)
            }
          />
          <div className={styles['copy-container']}>
            <p className={styles['label']}>{label}</p>
            <div className={styles['description']}>{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { InfoCard };
