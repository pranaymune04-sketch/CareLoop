import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search by ABHA ID, patient name, referral # or village...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-gov border border-gov-border bg-white pl-9 pr-8 py-2 text-xs text-gov-text-primary shadow-gov-sm placeholder:text-slate-400 focus:outline-none focus:border-gov-green-800 focus:ring-1 focus:ring-gov-green-800"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
