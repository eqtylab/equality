import styles from '@/components/code-block/code-block.module.css';
import { CopyButton } from '@/components/copy-button/copy-button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  className?: string;
  title: string;
  code: string;
  color?: 'primary' | 'secondary' | 'green' | 'red' | 'gold';
  codeLabel?: string;
  copy?: string;
}

const CodeBlock = ({
  className,
  title,
  code,
  color = 'primary',
  codeLabel,
  copy,
}: CodeBlockProps) => {
  return (
    <div className={cn(styles['code-block'], className)}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <CopyButton value={copy || code} size="sm" />
      </div>
      <div className={cn(styles.content, styles[color])}>
        <div className={cn(styles['scroll-container'], 'styled-vertical-scrollbar')}>
          {codeLabel && <div className={styles['code-label']}>{codeLabel}</div>}
          <pre className={styles.code}>{code}</pre>
        </div>
      </div>
    </div>
  );
};

export { CodeBlock };
