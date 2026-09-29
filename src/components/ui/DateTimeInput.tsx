import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimeInputProps {
  dateValue: string;
  timeValue?: string;
  onDateChange: (date: string) => void;
  onTimeChange?: (time: string) => void;
  minDate?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  dateValue,
  timeValue = '',
  onDateChange,
  onTimeChange,
  minDate,
  hasError,
  disabled,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${className}`}>
      {/* Date Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
        </div>
        <input
          type="date"
          value={dateValue}
          min={minDate}
          disabled={disabled}
          onChange={(e) => onDateChange(e.target.value)}
          className={`w-full rounded-gov border ${
            hasError ? 'border-red-400 focus:border-red-600' : 'border-gov-border focus:border-gov-green-800'
          } bg-white pl-9 pr-3 py-2 text-xs text-gov-text-primary shadow-gov-sm focus:outline-none focus:ring-1 focus:ring-gov-green-800 disabled:bg-slate-50`}
        />
      </div>

      {/* Time Field */}
      {onTimeChange && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <input
            type="time"
            value={timeValue}
            disabled={disabled}
            onChange={(e) => onTimeChange(e.target.value)}
            className={`w-full rounded-gov border ${
              hasError ? 'border-red-400 focus:border-red-600' : 'border-gov-border focus:border-gov-green-800'
            } bg-white pl-9 pr-3 py-2 text-xs text-gov-text-primary shadow-gov-sm focus:outline-none focus:ring-1 focus:ring-gov-green-800 disabled:bg-slate-50`}
          />
        </div>
      )}
    </div>
  );
};
