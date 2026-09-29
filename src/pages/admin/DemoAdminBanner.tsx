import React from 'react';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';

interface DemoAdminBannerProps {
  title?: string;
  badgeText?: string;
  variant?: 'info' | 'warning' | 'dashboard';
  className?: string;
}

export const DemoAdminBanner: React.FC<DemoAdminBannerProps> = ({
  title = 'Demo Administration View',
  badgeText = 'Mock Prototype Data',
  variant = 'info',
  className = '',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'warning':
        return {
          wrapper: 'bg-amber-50/90 border-amber-300 text-amber-950',
          badge: 'bg-amber-200 text-amber-900 border-amber-300',
          icon: <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />,
        };
      case 'dashboard':
        return {
          wrapper: 'bg-emerald-50/90 border-gov-green-200 text-gov-green-950',
          badge: 'bg-gov-green-200 text-gov-green-950 border-gov-green-300',
          icon: <ShieldCheck className="w-4 h-4 text-gov-green-800 shrink-0 mt-0.5" />,
        };
      default:
        return {
          wrapper: 'bg-slate-50 border-slate-200 text-slate-900',
          badge: 'bg-slate-200 text-slate-800 border-slate-300',
          icon: <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />,
        };
    }
  };

  const style = getColors();

  return (
    <div
      role="region"
      aria-label="Demo Administrative Disclosure"
      className={`p-3.5 rounded-gov border shadow-gov-sm flex items-start gap-3 text-xs ${style.wrapper} ${className}`}
    >
      {style.icon}
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold tracking-tight text-xs uppercase">{title}</span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style.badge}`}
          >
            {badgeText}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">
          Metrics are generated from mock prototype data. CareLoop is not connected to live ABDM, live hospital HIS systems, or government reporting infrastructure.
        </p>
      </div>
    </div>
  );
};
