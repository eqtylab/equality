import styles from '@/components/code-block/code-block.module.css';
import { CopyButton } from '@/components/copy-button/copy-button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  className?: string;
  title: string;
  code: string;
  color?: 'lilac' | 'mint';
  codeLabel?: string;
  copy?: string;
}

const CodeBlock = ({
  className,
  title,
  code,
  color = 'lilac',
  codeLabel,
  copy,
}: CodeBlockProps) => {
  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <CopyButton value={copy || code} size="sm" />
      </div>
      <div
        className={cn(
          styles.content,
          color === 'mint' ? styles['border-mint'] : styles['border-lilac']
        )}
      >
        <div className={cn(styles['scroll-container'], 'styled-vertical-scrollbar')}>
          {codeLabel && <div className={styles['code-label']}>{codeLabel}</div>}
          <pre className={styles.code}>{code}</pre>
        </div>
      </div>
    </div>
  );
};

export { CodeBlock };
