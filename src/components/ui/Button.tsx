import React from 'react';

export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'emergency'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base public healthcare styling: accessible, solid, practical
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-gov transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
      md: 'px-4 py-2 text-sm gap-2 min-h-[38px]',
      lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[44px]',
    };

    const variantStyles = {
      primary: 'bg-gov-green-800 hover:bg-gov-green-900 active:bg-gov-green-950 text-white shadow-gov-sm focus-visible:outline-gov-green-800',
      secondary: 'bg-gov-green-100 hover:bg-gov-green-200 active:bg-gov-green-300 text-gov-green-900 focus-visible:outline-gov-green-800',
      outline: 'border border-gov-border bg-white hover:bg-slate-50 text-gov-text-primary shadow-gov-sm focus-visible:outline-gov-green-800',
      ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-gov-text-primary focus-visible:outline-gov-green-800',
      emergency: 'bg-red-700 hover:bg-red-800 active:bg-red-900 text-white shadow-gov-sm font-semibold tracking-wide focus-visible:outline-red-700',
      destructive: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 focus-visible:outline-red-700',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
