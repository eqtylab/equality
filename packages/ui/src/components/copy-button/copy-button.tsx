import * as React from 'react';

import { IconButton } from '@/components/icon-button/icon-button';

export interface CopyButtonProps {
  value: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

function CopyButton({
  value,
  label = 'Copy to clipboard',
  size = 'sm',
  className,
  onClick,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      // Try modern Clipboard API first (requires HTTPS)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Fallback to legacy method
      const textArea = document.createElement('textarea');
      textArea.value = value;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleClick = () => {
    handleCopy();
    onClick?.();
  };

  return (
    <IconButton
      name={copied ? 'Check' : 'Copy'}
      label={copied ? 'Copied!' : label}
      size={size}
      onClick={handleClick}
      className={className}
    />
  );
}

export { CopyButton };
