"use client"
import { useEffect, useState } from "react"
import { X, Download } from "lucide-react"

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) { setDismissed(true); return }
    const handler = (e: any) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed || (!prompt && !isIOS)) return null

  return (
    <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+8px)] left-4 right-4 z-50 rounded-xl border border-border/60 bg-background/98 p-4 shadow-lg backdrop-blur-xl">
      <button onClick={() => setDismissed(true)} className="absolute right-3 top-3 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brown-900">
          <span className="font-display text-sm font-bold text-amber-500">GL</span>
        </div>
        <div className="flex-1 pr-6">
          <p className="text-sm font-semibold text-foreground">Add to Home Screen</p>
          {isIOS ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Tap <strong>Share</strong> then <strong>Add to Home Screen</strong>
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                Install for faster access and offline support
              </p>
              <button
                onClick={async () => { await prompt.prompt(); setDismissed(true) }}
                className="mt-2 flex items-center gap-1.5 rounded-md bg-brown-900 px-3 py-1.5 text-xs font-semibold text-white active:scale-95 transition-transform"
              >
                <Download className="h-3.5 w-3.5" /> Install App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
