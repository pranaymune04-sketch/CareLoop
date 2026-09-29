import React from 'react';

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  helperText,
  error,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold text-gov-text-primary"
        >
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}
      <div>{children}</div>
      {error ? (
        <p className="text-[11px] text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-gov-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded-gov border ${
          hasError ? 'border-red-400 focus:border-red-600' : 'border-gov-border focus:border-gov-green-800'
        } bg-white px-3 py-2 text-xs text-gov-text-primary shadow-gov-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-gov-green-800 disabled:bg-slate-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
