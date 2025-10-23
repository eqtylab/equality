import { cn } from '../lib/utils';
import { CopyButton } from './copy-button';

interface CodeBlockProps {
  className?: string;
  title: string;
  code: string;
  color?: 'lilac' | 'emerald';
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
    <div className={cn('border-border overflow-hidden rounded-md border', className)}>
      <div className="bg-background flex items-center justify-between px-3 py-2">
        <span className="text-muted-foreground text-sm font-medium">{title}</span>
        <CopyButton value={copy || code} size="sm" />
      </div>
      <div
        className={cn(
          'bg-foreground/5 rounded-b-md border p-3 font-mono text-xs',
          color === 'emerald' ? 'border-emerald-500' : 'border-lilac'
        )}
      >
        <div className="styled-vertical-scrollbar max-h-64 overflow-y-auto">
          {codeLabel && <div className="text-muted-foreground mb-1">{codeLabel}</div>}
          <pre className="break-all whitespace-pre-wrap">{code}</pre>
        </div>
      </div>
    </div>
  );
};

export { CodeBlock };
