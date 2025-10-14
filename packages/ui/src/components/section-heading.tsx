import { cn } from '../lib/utils';

interface SectionHeadingProps {
  className?: string;
  heading: string;
  description?: string;
  renderRightContent?: () => React.ReactNode;
}

const SectionHeading = ({
  heading,
  description,
  renderRightContent,
  className,
}: SectionHeadingProps) => {
  const hasRightContent = !!renderRightContent;

  return (
    <div
      className={cn(
        hasRightContent && 'border-border flex items-center justify-between border-b pb-2',
        className
      )}
    >
      <div className="space-y-1">
        <h3 className="text-xl font-medium">{heading}</h3>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      {hasRightContent && renderRightContent()}
    </div>
  );
};

export { SectionHeading };
