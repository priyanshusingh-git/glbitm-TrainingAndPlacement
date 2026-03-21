"use client"

import React from "react"
import { Check, Circle, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Stage {
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface PlacementPipelineProps {
  company: string;
  role: string;
  stages: Stage[];
}

export function PlacementPipeline({ company, role, stages }: PlacementPipelineProps) {
  const completedRatio =
    stages.length > 1
      ? (stages.filter((stage) => stage.status === "completed").length / (stages.length - 1)) * 100
      : 0

  return (
    <div className="card-base p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold font-display text-brown-900">{company}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-bold text-blue-600 ring-1 ring-blue-500/20 uppercase tracking-wider">
          In Progress
        </span>
      </div>

      <div className="relative flex items-center justify-between px-2">
        {/* Connection Line */}
        <div className="absolute left-10 right-10 top-5 h-0.5 bg-muted/40" />
        <progress
          aria-hidden="true"
          className="placement-pipeline-progress absolute left-10 top-5 h-0.5"
          max={100}
          value={completedRatio}
        />

        {stages.map((stage, idx) => (
          <div key={stage.label} className="relative z-10 flex flex-col items-center gap-2">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
              stage.status === 'completed' 
                ? "bg-amber-500 border-amber-500 text-brown-900 shadow-lg shadow-amber-500/20" 
                : stage.status === 'current'
                  ? "bg-brown-900 border-white text-white shadow-xl"
                  : "bg-white border-muted text-muted-foreground"
            )}>
              {stage.status === 'completed' ? (
                <Check className="h-5 w-5" />
              ) : stage.status === 'current' ? (
                <ArrowRight className="h-5 w-5" />
              ) : (
                <span className="text-sm font-bold">{idx + 1}</span>
              )}
            </div>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-wider",
              stage.status === 'pending' ? "text-muted-foreground/60" : "text-foreground"
            )}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-md bg-muted/40 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white shadow-sm">
          <CalendarIcon className="h-4 w-4 text-amber-600" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">
          Aptitude test scheduled for <span className="font-bold text-foreground">Dec 15, 2024 — 10:00 AM</span>
        </p>
      </div>
    </div>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  )
}
