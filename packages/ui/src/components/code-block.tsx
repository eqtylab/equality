import { useState } from 'react';
import { CheckCheck, Copy } from 'lucide-react';

import { cn } from '../lib/utils';

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
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(copy || code)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 1000);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <div className={cn('border-border overflow-hidden rounded-md border', className)}>
      <div className="bg-background flex items-center justify-between px-3 py-2">
        <span className="text-muted-foreground text-sm font-medium">{title}</span>
        <button
          onClick={handleCopy}
          disabled={isCopied}
          className="hover:text-lilac h-7 transition-all duration-200 hover:scale-110 hover:opacity-70 active:scale-95 disabled:cursor-default disabled:hover:scale-100 disabled:hover:opacity-100 [&>svg]:size-4"
        >
          {isCopied ? <CheckCheck className="text-green-500" /> : <Copy />}
        </button>
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
