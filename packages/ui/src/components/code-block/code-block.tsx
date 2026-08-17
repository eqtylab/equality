import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { Badge } from '@/components/badge/badge';
import styles from '@/components/code-block/code-block.module.css';
import { CopyButton } from '@/components/copy-button/copy-button';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  className?: string;
  title?: string;
  code: string;
  language?: string;
  variant?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
  codeLabel?: string;
  copy?: string;
}

const WRAP = true;

const CodeBlock = ({
  className,
  title,
  code,
  language = 'text',
  variant = 'neutral',
  codeLabel,
  copy,
}: CodeBlockProps) => {
  return (
    <div className={cn(styles['code-block'], styles[variant], className)}>
      <div className={styles.header}>
        <div className={styles['header-left']}>
          {title && <span className={styles.title}>{title}</span>}
          <Badge variant="neutral" className={styles['badge']}>
            {language}
          </Badge>
        </div>
        <div className={styles['header-right']}>
          <CopyButton value={copy || code} size="sm" />
        </div>
      </div>
      <div className={cn(styles.content)}>
        <SyntaxHighlighter
          language={language}
          // Tokens carry their Prism class names and the palette lives in the stylesheet,
          // so the theme resolves through the cascade instead of being resolved in JS.
          useInlineStyles={false}
          wrapLines={WRAP}
          wrapLongLines={WRAP}
          className={styles.pre}
          codeTagProps={{ className: cn(styles.code, { [styles.wrap]: WRAP }) }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      {codeLabel && (
        <div className={styles['code-label']}>
          <p className={styles['code-label-text']}>{codeLabel}</p>
        </div>
      )}
    </div>
  );
};

export { CodeBlock };
