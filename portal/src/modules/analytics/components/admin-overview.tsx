"use client"

import { BentoGrid, BentoGridItem } from "@/components/layout/dashboard/bento-grid"
import { Users, UserCheck, TrendingUp, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { adminOverviewConfig } from "@/data/dashboard"

interface AdminOverviewProps {
  overview?: {
    totalStudents: string;
    placedStudents: string;
    avgScore: string;
    activeCompanies: number;
  }
}

const iconMap: Record<string, any> = { Users, UserCheck, TrendingUp, Building2 };

export function AdminOverview({ overview }: AdminOverviewProps) {
  const items = adminOverviewConfig.map((config) => {
    const IconComponent = iconMap[config.iconName];
    // Map config.key to overview data
    const value = overview?.[config.key as keyof typeof overview] || (config.key === 'avgScore' ? '0%' : '0');
    
    return {
      title: config.title,
      hover: config.hoverClass,
      className: "md:col-span-1",
      description: (
        <div className="flex flex-col gap-1 mt-1.5">
          <span className="text-xl font-bold text-foreground tabular-nums md:text-2xl">{value}</span>
          <span className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider leading-tight">{config.label}</span>
        </div>
      ),
      header: (
        <div className={cn(config.toneClass, "flex h-full min-h-[4rem] md:min-h-[6rem] w-full flex-1 rounded-md border border-border/40 relative overflow-hidden group/header bg-background")}>
          <div 
            className="absolute inset-0" 
            style={{ background: `radial-gradient(circle at 50% 0%, ${config.gradient}, transparent)` }} 
          />
          <IconComponent className="absolute -bottom-2 -right-2 h-16 w-16 md:h-24 md:w-24 opacity-10 group-hover/header:scale-110 transition-transform duration-500 text-foreground" />
        </div>
      ),
      icon: <IconComponent className="h-4 w-4 opacity-70" />,
    };
  });

  return (
    <BentoGrid className="max-w-full gap-4">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={<span className="section-tag text-muted-foreground/80">{item.title}</span>}
          description={<div className="font-display text-2xl font-bold text-brown-900 mt-1">{item.description}</div>}
          header={item.header}
          icon={item.icon}
          className={cn(
            "transition-base border-border/50 hover:shadow-lg",
            item.hover,
            item.className
          )}
        />
      ))}
    </BentoGrid>
  )
}
