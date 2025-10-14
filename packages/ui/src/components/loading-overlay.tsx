import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingOverlay({ isVisible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="flex flex-col items-center rounded-lg bg-zinc-950 p-6 shadow-xl">
        <Loader2 className="text-purple h-10 w-10 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-200">{message}</p>
      </div>
    </div>
  );
}
