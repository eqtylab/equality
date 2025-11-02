import styles from '@/components/section-heading/section-heading.module.css';
import { cn } from '@/lib/utils';

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
    <div className={cn(hasRightContent && styles['section-heading--right-content'], className)}>
      <div className={styles['content']}>
        <h3 className={styles['heading']}>{heading}</h3>
        {description && <p className={styles['description']}>{description}</p>}
      </div>
      {hasRightContent && renderRightContent()}
    </div>
  );
};

export { SectionHeading };
