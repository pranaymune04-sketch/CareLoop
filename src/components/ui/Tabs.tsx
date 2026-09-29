import React from 'react';

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-gov border border-gov-border/60 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  className?: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  active,
  onClick,
  children,
  count,
  className = '',
}) => {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all duration-150 ${
        active
          ? 'bg-white text-gov-green-900 shadow-gov-sm font-semibold'
          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
      } ${className}`}
    >
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            active ? 'bg-gov-green-100 text-gov-green-900' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  activeTab,
  children,
  className = '',
}) => {
  if (value !== activeTab) return null;
  return (
    <div role="tabpanel" className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};
