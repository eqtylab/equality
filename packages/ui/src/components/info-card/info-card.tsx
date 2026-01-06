import * as React from 'react';

import { Card, CardContent } from '@/components/card/card';
import { Icon } from '@/components/icon/icon';
import styles from '@/components/info-card/info-card.module.css';

interface InfoCardProps {
  label: string;
  description: string | number | React.ReactNode;
  icon: React.ReactElement | string;
  className?: string;
  onClick?: () => void;
}

const InfoCard = ({ label, description, icon, className, onClick, ...props }: InfoCardProps) => {
  return (
    <Card className={className} onClick={onClick} {...props}>
      <CardContent>
        <div className={styles['info-card-content']}>
          <Icon icon={icon} size="sm" background="square" />
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
