import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Records',
  message = 'A temporary network or server error occurred. Please check your connectivity and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-6 bg-red-50/70 border border-red-200 rounded-gov flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-red-900">{title}</h4>
          <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="bg-white border-red-300 text-red-800 hover:bg-red-50 shrink-0"
        >
          Retry
        </Button>
      )}
    </div>
  );
};
