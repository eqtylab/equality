import * as React from 'react';

import { IconButton } from './icon-button';

export interface CopyButtonProps {
  value: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function CopyButton({ value, label = 'Copy to clipboard', size = 'md', className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <IconButton
      name={copied ? 'Check' : 'Copy'}
      label={copied ? 'Copied!' : label}
      size={size}
      onClick={handleCopy}
      className={className}
    />
  );
}

export { CopyButton };
