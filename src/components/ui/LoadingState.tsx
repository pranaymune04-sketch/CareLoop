import React from 'react';

interface LoadingStateProps {
  message?: string;
  variant?: 'spinner' | 'skeleton';
  rows?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading healthcare records...',
  variant = 'spinner',
  rows = 3,
  className = '',
}) => {
  if (variant === 'skeleton') {
    return (
      <div className={`space-y-3 p-4 bg-white rounded-gov border border-gov-border ${className}`} role="status" aria-label="Loading content">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="rounded bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="status"
    >
      <div className="w-8 h-8 border-2 border-slate-200 border-t-gov-green-800 rounded-full animate-spin mb-3"></div>
      <p className="text-xs text-gov-text-secondary font-medium">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
};
