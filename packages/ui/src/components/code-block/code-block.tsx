import { useEffect, useMemo } from 'react';

import { Badge } from '@/components/badge/badge';
import styles from '@/components/code-block/code-block.module.css';
import { CopyButton } from '@/components/copy-button/copy-button';
import { CODE_BLOCK_ATTRIBUTE, scheduleHighlight } from '@/lib/highlight';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  className?: string;
  title?: string;
  code: string;
  language?: string;
  variant?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
  codeLabel?: string;
  copy?: string;
  lineNumbers?: boolean;
}

const CodeBlock = ({
  className,
  title,
  code,
  language = 'text',
  variant = 'neutral',
  codeLabel,
  copy,
  lineNumbers = false,
}: CodeBlockProps) => {
  // Unmount rescans too, so ranges pointing at removed nodes leave the registry
  useEffect(() => {
    void scheduleHighlight();
    return () => void scheduleHighlight();
  }, [code, language]);

  const gutter = useMemo(() => {
    if (!lineNumbers) return null;
    // A trailing newline closes the last line rather than opening another
    const lines = code.replace(/\n$/, '').split('\n').length;
    return Array.from({ length: lines }, (_, index) => index + 1).join('\n');
  }, [code, lineNumbers]);

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
      {/* Focusable so the overflow it owns is reachable by keyboard, not just by pointer */}
      <div
        className={cn(styles.content)}
        tabIndex={0}
        role="region"
        aria-label={title ? `${title}, code block` : 'Code block'}
      >
        <div className={cn(styles.body, { [styles.numbered]: lineNumbers })}>
          {gutter && (
            <pre aria-hidden="true" className={styles.gutter}>
              {gutter}
            </pre>
          )}
          {/* Ranges are registered against the text node, so `code` must hold no markup */}
          <pre className={styles.pre} {...{ [CODE_BLOCK_ATTRIBUTE]: '' }}>
            <code
              className={cn(styles.code, `language-${language}`, { [styles.wrap]: !lineNumbers })}
            >
              {code}
            </code>
          </pre>
        </div>
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
