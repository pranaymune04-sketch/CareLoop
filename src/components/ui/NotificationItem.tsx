import React from 'react';
import { Notification } from '@/types';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  className?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  className = '',
}) => {
  const getIcon = () => {
    switch (notification.severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-600 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.severity) {
      case 'critical':
        return 'border-l-4 border-l-red-600 bg-red-50/40';
      case 'high':
        return 'border-l-4 border-l-amber-500 bg-amber-50/30';
      default:
        return 'border-l-4 border-l-sky-500 bg-white';
    }
  };

  return (
    <div
      onClick={() => onRead?.(notification.id)}
      className={`p-3 rounded-gov border border-gov-border transition-colors ${getBorderColor()} ${
        !notification.isRead ? 'shadow-gov-sm' : 'opacity-80'
      } ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-xs font-semibold text-gov-text-primary truncate">
              {notification.title}
            </h5>
            <span className="text-[10px] text-slate-400 shrink-0">
              {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-[11px] text-gov-text-secondary mt-0.5 leading-relaxed">
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
};
