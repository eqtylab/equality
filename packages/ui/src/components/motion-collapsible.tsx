import { ReactNode, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface MotionCollapsibleContentProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export const MotionCollapsibleContent = ({
  isOpen,
  children,
  className,
}: MotionCollapsibleContentProps) => {
  const [contentHeight, setContentHeight] = useState<number>(0);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current) {
          setContentHeight(contentRef.current.scrollHeight);
        }
      });

      resizeObserver.observe(contentRef.current);
      setContentHeight(contentRef.current.scrollHeight);

      return () => resizeObserver.disconnect();
    }
  }, [children]);

  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <motion.div
          key="motion-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: contentHeight, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`overflow-hidden ${className}`}
        >
          <div ref={contentRef}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
