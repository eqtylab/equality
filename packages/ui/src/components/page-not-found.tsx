import { AlertTriangle, Home } from 'lucide-react';

import { Button } from './button/button';

interface NotFoundProps {
  title?: string;
  description?: string;
  showHomeButton?: boolean;
  onHomeClick?: () => void;
}

export const NotFound = ({
  title = 'Oops! Page Not Found',
  description = "The page or resource you're looking for doesn't exist or has been moved.",
  showHomeButton = true,
  onHomeClick = () => (window.location.href = '/dashboard'),
}: NotFoundProps) => {
  return (
    <div className="flex items-center justify-center px-8 py-16 text-white">
      <div className="max-w-xl space-y-6 px-4 text-center">
        {/* Icon */}
        <div className="text-red mx-auto flex size-20 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 shadow-lg">
          <AlertTriangle className="h-10 w-10 animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>

        {/* Description */}
        <p className="text-md text-muted-foreground">{description}</p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          {showHomeButton && (
            <Button onClick={onHomeClick} variant="primary">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
