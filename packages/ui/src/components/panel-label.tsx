import { cn } from '../lib/utils';

interface PanelLabelProps {
  className?: string;
  label: string;
}

const PanelLabel = ({ className, label }: PanelLabelProps) => {
  return (
    <div className={cn('text-xxs font-semibold tracking-[0.5px] uppercase', className)}>
      {label}
    </div>
  );
};

export { PanelLabel };
