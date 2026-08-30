import { Heading } from "@/components/ui/heading"

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center bg-background">
      <div className="text-5xl">📡</div>
      <Heading variant="page-title">You're offline</Heading>
      <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
        No internet connection. Pages you've previously visited are still available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="min-h-[44px] rounded-lg bg-brown-800 hover:bg-brown-900 px-6 text-sm font-semibold text-white active:scale-95 transition-transform"
      >
        Try again
      </button>
    </div>
  )
}
