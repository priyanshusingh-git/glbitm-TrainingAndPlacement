import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LoadingCardProps {
  className?: string
  showHeader?: boolean
}

export function LoadingCard({ className, showHeader = true }: LoadingCardProps) {
  return (
    <Card className={cn("animate-in fade-in-50 border-border/60 shadow-sm", className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </CardContent>
    </Card>
  )
}

export function HeroBannerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-brown-900 bg-hero-gradient p-5 md:p-8 text-white shadow-lg shadow-brown-900/10 animate-fade-up">
      <div className="absolute inset-0 bg-diagonal-lines opacity-20" />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="flex flex-col gap-2">
          <div className="h-9 md:h-11 w-64 md:w-80 animate-pulse rounded-md bg-white/20" />
          <div className="h-4 w-44 animate-pulse rounded-md bg-white/10 mt-1" />
        </div>

        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-bubble bg-white/5 border border-white/10 w-28 h-16 flex flex-col justify-center px-4 rounded-md">
              <div className="h-6 w-12 animate-pulse rounded bg-amber-500/30 mb-1" />
              <div className="h-3 w-16 animate-pulse rounded bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* 4 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 border-border/60 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      {/* 2 Chart Box Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-6 border-border/60 shadow-sm space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function LoadingTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  const delayClasses = ["delay-0", "delay-100", "delay-150", "delay-200", "delay-300", "delay-500"]
  return (
    <div className="space-y-4 w-full">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 rounded-t-xl border border-border/60 bg-muted/20 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1">
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      {/* Table Rows Skeleton */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className={cn("animate-in fade-in-50 flex items-center gap-4 rounded-lg border border-border/40 px-4 py-3", delayClasses[Math.min(rowIdx, delayClasses.length - 1)])}
          >
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div key={colIdx} className="flex-1">
                {colIdx === 0 ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ) : colIdx === cols - 1 ? (
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                    <Skeleton className="h-3 w-full max-w-[80px]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function LoadingGrid({ items = 6, className }: { items?: number; className?: string }) {
  const delayClasses = ["delay-0", "delay-100", "delay-150", "delay-200", "delay-300", "delay-500"]
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <LoadingCard
          key={i}
          className={cn("animate-in fade-in-50", delayClasses[Math.min(i, delayClasses.length - 1)])}
        />
      ))}
    </div>
  )
}

export function LoadingSpinner({ size = "md", text, className }: { size?: "sm" | "md" | "lg"; text?: string; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}>
      <Skeleton className={cn("rounded-full", sizeClasses[size])} />
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-up">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <LoadingGrid items={6} />
    </div>
  )
}

export function LoadingProfile() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <Card className="p-6 border-border/60 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-3 text-center md:text-left w-full">
            <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
            <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md rounded-md" />
        <LoadingGrid items={4} />
      </div>
    </div>
  )
}

export function TestTakerSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col p-6 space-y-6 animate-in fade-in-50 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <Card className="p-8 border-border/60 shadow-sm space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-5/6" />
        </div>
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-background/50">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-border/40">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </Card>
    </div>
  )
}

export function DetailHeaderSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-2 border-b pb-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <LoadingGrid items={6} />
    </div>
  )
}

