import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-gov-green-800 mb-4">
        <AlertCircle className="w-8 h-8 text-gov-green-800" />
      </div>
      <h1 className="text-xl font-bold text-gov-text-primary mb-1">
        Page Not Found (404)
      </h1>
      <p className="text-xs text-gov-text-secondary max-w-sm mb-6 leading-relaxed">
        The requested healthcare portal route does not exist or has been relocated.
      </p>
      <Link to="/">
        <Button variant="primary" size="sm" leftIcon={<Home className="w-3.5 h-3.5" />}>
          Return to Portal Gateway
        </Button>
      </Link>
    </div>
  );
};
