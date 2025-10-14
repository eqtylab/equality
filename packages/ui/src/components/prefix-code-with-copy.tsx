import { useState } from 'react';
import { CheckCheck, Copy } from 'lucide-react';

import { cn } from '../lib/utils';
import PrefixCode from './prefix-code';

interface PrefixCodeWithCopyProps {
  value: string;
  className?: string;
}

const PrefixCodeWithCopy = ({ value, className }: PrefixCodeWithCopyProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(value)
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
    <div className={cn('relative flex items-center gap-2', className)}>
      <div className="flex-1">
        <PrefixCode value={value} />
      </div>
      <button
        onClick={handleCopy}
        disabled={isCopied}
        className="hover:text-lilac transition-all duration-200 hover:scale-110 hover:opacity-70 active:scale-95 disabled:cursor-default disabled:hover:scale-100 disabled:hover:opacity-100 [&>svg]:size-4"
      >
        {isCopied ? <CheckCheck className="text-green-500" /> : <Copy />}
      </button>
    </div>
  );
};

export default PrefixCodeWithCopy;
