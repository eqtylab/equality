import { useEffect, useRef, useState } from 'react';

import { cn } from '../lib/utils';

interface PrefixCodeProps {
  className?: string;
  value: string;
}

const PrefixCode = ({ className, value }: PrefixCodeProps) => {
  const [truncatedString, setTruncatedString] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  const splitValue = value.split(':');
  let prefix = '';
  let id = value;

  if (splitValue.length === 3) {
    prefix = splitValue[1];
    id = splitValue[2];
  } else if (splitValue.length === 2) {
    prefix = splitValue[0];
    id = splitValue[1];
  } else if (!prefix && value.startsWith('0x')) {
    prefix = '0x';
  }

  const isHexadecimal = prefix.startsWith('0x');
  const displayPrefix = isHexadecimal ? prefix : prefix.toUpperCase();

  // Update container width and truncation when component mounts or resizes
  useEffect(() => {
    // Function to calculate optimal truncation based on available width
    const calculateTruncation = (availableWidth: number) => {
      // Account for padding, margins
      const padding = 16; // p-2 on both sides = 8px each
      const ellipsisWidth = 12; // Approximate width of "..."
      const availableTextWidth = availableWidth - padding - ellipsisWidth;

      // Estimate character width (monospace font, text-xs)
      const charWidth = 7; // Approximate width of a character in text-xs
      const maxChars = Math.floor(availableTextWidth / charWidth);

      if (maxChars <= 0) return '...';
      if (maxChars >= id.length) return id;

      // Calculate how many characters we can show
      const startChars = Math.max(1, Math.floor((maxChars - 3) / 2));
      const endChars = Math.max(1, maxChars - startChars - 3);

      if (isHexadecimal) {
        const start = Math.max(2, id.length - endChars - startChars);
        return `${id.slice(2, start + startChars)}...${id.slice(-endChars)}`;
      } else {
        return `${id.slice(0, startChars)}...${id.slice(-endChars)}`;
      }
    };

    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setTruncatedString(calculateTruncation(width));
      }
    };

    // Initial measurement
    updateWidth();

    // Set up resize observer
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [value, isHexadecimal, id, prefix]);

  return (
    <div className={cn('flex max-w-full items-center rounded bg-white/10', className)}>
      {prefix && (
        <div className="bg-medium-lilac flex size-10 items-center justify-center rounded p-2 font-mono text-xs font-semibold text-black">
          {displayPrefix}
        </div>
      )}
      <div className="w-full p-2" ref={containerRef}>
        <code className="absolute top-1/2 -translate-y-1/2 text-xs font-medium">
          {truncatedString}
        </code>
      </div>
    </div>
  );
};

export default PrefixCode;
