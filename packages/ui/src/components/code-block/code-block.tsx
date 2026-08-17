import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import darkStyle from 'react-syntax-highlighter/dist/esm/styles/prism/a11y-dark';
import lightStyle from 'react-syntax-highlighter/dist/esm/styles/prism/prism';

import { Badge } from '@/components/badge/badge';
import styles from '@/components/code-block/code-block.module.css';
import { CopyButton } from '@/components/copy-button/copy-button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/theme/hooks/use-theme';
import { useThemeScope } from '@/theme/theme-scope';

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
  const scopedTheme = useThemeScope();
  // Page-wide state is the fallback: it is a single value, so it is wrong whenever
  // two themes are on screen, and it resolves by walking the document, which cannot
  // see into a shadow tree.
  const [globalTheme] = useTheme();
  const theme = scopedTheme ?? globalTheme;

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
          style={theme === 'dark' ? darkStyle : lightStyle}
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
