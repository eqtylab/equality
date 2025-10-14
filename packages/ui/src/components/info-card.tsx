import { LucideIcon } from 'lucide-react';

import { Card, CardContent } from './card';
import { IconSquare } from './icon-square';

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
  return (
    <Card className={className} onClick={onClick} {...props}>
      <CardContent>
        <div className="flex items-center gap-3">
          <IconSquare icon={Icon} size="sm" />
          <div className="flex-1">
            <p className="text-muted-foreground text-xs">{label}</p>
            <div className="text-foreground text-sm font-semibold">{description}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { InfoCard };
