import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8", className)}>
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-[15px] font-normal leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
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
    <div className={cn("flex flex-col gap-2 mb-6", className)}>
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brown-800/10 text-brown-800 border border-brown-800/20">
            {React.cloneElement(icon as React.ReactElement<any>, { className: 'h-4 w-4' })}
          </div>
        )}
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xl pl-10">
          {description}
        </p>
      )}
    </div>
  );
}
