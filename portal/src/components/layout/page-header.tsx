import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/ui/heading';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div data-slot="page-header" className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8", className)}>
      <div className="space-y-1.5">
        <Heading variant="page-title">{title}</Heading>
      </div>
      {action && (
        <div className="flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, icon, className }: SectionHeaderProps) {
  return (
    <div data-slot="section-header" className={cn("flex flex-col gap-2 mb-6", className)}>
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-sm bg-brown-900/5 text-brown-900 border border-brown-900/10">
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'h-4 w-4' })}
          </div>
        )}
        <Heading variant="section-title">{title}</Heading>
      </div>
    </div>
  );
}

