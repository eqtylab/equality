import { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import styles from '@/components/motion-collapsible/motion-collapsible.module.css';
import { cn } from '@/lib/utils';

interface MotionCollapsibleContentProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

const MotionCollapsibleContent = ({
  isOpen,
  children,
  className,
}: MotionCollapsibleContentProps) => {
  const [isSettled, setIsSettled] = useState(isOpen);

  // Animates to `auto`, not a measured height: a measurement starts at 0, so content that
  // mounts open would grow on every page load
  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <motion.div
          key="motion-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onAnimationStart={() => setIsSettled(false)}
          onAnimationComplete={() => setIsSettled(isOpen)}
          className={cn(
            styles['motion-collapsible'],
            isSettled && styles['motion-collapsible--settled'],
            className
          )}
        >
          <div>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { MotionCollapsibleContent };
