import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const headingVariants = cva(
  'tracking-tight text-foreground transition-colors',
  {
    variants: {
      variant: {
        'display-hero': 'font-display text-hero font-extrabold leading-[1.04] text-brown-900',
        'display-section': 'font-display text-h2 font-bold leading-[1.06] text-brown-900',
        'page-title': 'font-display text-3xl font-bold tracking-tight text-foreground',
        'section-title': 'font-display text-xl font-bold tracking-tight text-foreground',
        'card-title': 'font-display text-lg font-semibold tracking-tight text-foreground',
        eyebrow: 'font-sans text-xs font-bold uppercase tracking-widest text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'page-title',
    },
  }
);

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';

const defaultTags: Record<NonNullable<VariantProps<typeof headingVariants>['variant']>, HeadingTag> = {
  'display-hero': 'h1',
  'display-section': 'h2',
  'page-title': 'h1',
  'section-title': 'h2',
  'card-title': 'h3',
  eyebrow: 'span',
};

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant = 'page-title', as, ...props }, ref) => {
    const Tag = as || defaultTags[variant || 'page-title'] || 'h1';

    return (
      <Tag
        ref={ref as any}
        className={cn(headingVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';
