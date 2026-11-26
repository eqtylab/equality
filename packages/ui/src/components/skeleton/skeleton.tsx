import styles from '@/components/skeleton/skeleton.module.css';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // data-slot: apps select this to restyle placeholders; renaming it breaks them
  return <div data-slot="skeleton" className={cn(styles['skeleton'], className)} {...props} />;
}

export { Skeleton };
