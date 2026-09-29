import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div className={`mb-6 space-y-2.5 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-gov-text-primary tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs text-gov-text-secondary leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
