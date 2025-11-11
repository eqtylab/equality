import * as React from 'react';
import { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/card/card';
import { IconSquare } from '@/components/icon-square/icon-square';
import styles from '@/components/info-card/info-card.module.css';

interface InfoCardProps {
  label: string;
  description: string | number;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
}

const InfoCard = ({
  label,
  description,
  icon: Icon,
  className,
  onClick,
  ...props
}: InfoCardProps) => {
  const IconComponent = Icon as React.ElementType;
  return (
    <Card className={className} onClick={onClick} {...props}>
      <CardContent>
        <div className={styles['info-card-content']}>
          <IconSquare icon={IconComponent} size="sm" />
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
