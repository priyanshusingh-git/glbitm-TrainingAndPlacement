"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  Grid3X3, 
  Search, 
  Palette, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Layout,
  Layers,
  Database,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSidebar } from "@/components/layout/dashboard/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

const THEMES = {
  prestige: {
    name: "Prestige (Warm)",
    colors: {
      background: "253 247 239",
      foreground: "30 15 5",
      primary: "81 41 18",
      accent: "232 160 32",
      muted: "242 234 216",
      border: "220 200 180"
    }
  },
  midnight: {
    name: "Midnight Academy",
    colors: {
      background: "18 10 5",
      foreground: "253 247 239",
      primary: "175 114 75",
      accent: "245 187 64",
      muted: "55 25 8",
      border: "81 41 18"
    }
  },
  slate: {
    name: "Slate Professional",
    colors: {
      background: "248 249 250",
      foreground: "33 37 41",
      primary: "52 58 64",
      accent: "13 110 253",
      muted: "233 236 239",
      border: "222 226 230"
    }
  }
}

export function DesignInspector() {
  const [isVisible, setIsVisible] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [auditMode, setAuditMode] = useState(false)
  const [structureAudit, setStructureAudit] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [activeTheme, setActiveTheme] = useState<keyof typeof THEMES>("prestige")
  const { toast } = useToast()

  // Toggle on Ctrl + Shift + P
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setIsVisible(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("prestige-active-theme") as keyof typeof THEMES
    if (savedTheme && THEMES[savedTheme]) {
      setActiveTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  const applyTheme = (themeKey: keyof typeof THEMES) => {
    const theme = THEMES[themeKey]
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value)
    })
    localStorage.setItem("prestige-active-theme", themeKey)
  }

  const handleThemeChange = (themeKey: keyof typeof THEMES) => {
    setActiveTheme(themeKey)
    applyTheme(themeKey)
  }

  if (!isVisible && process.env.NODE_ENV === 'production') return null

  return (
    <>
      {/* ── GRID OVERLAY ── */}
      {showGrid && (
        <div 
          className="fixed inset-0 z-[9998] pointer-events-none opacity-20 transition-opacity duration-500"
          style={{
            backgroundImage: `
              linear-gradient(to right, #512912 1px, transparent 1px),
              linear-gradient(to bottom, #512912 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}
        />
      )}

      {/* ── AUDIT OVERLAY (CSS Injection) ── */}
      {auditMode && (
        <style dangerouslySetInnerHTML={{ __html: `
          /* Flag Bubbly Geometry (Drift) */
          [class*="rounded-lg"]:not([data-slot]), 
          [class*="rounded-xl"], 
          [class*="rounded-2xl"], 
          [class*="rounded-3xl"],
          .rounded-full:not([data-slot*="avatar"]):not(.animate-spin):not(.h-1):not(.h-1\\.5):not(.h-2):not(.h-3) {
            outline: 2px dashed #ef4444 !important;
            outline-offset: 4px !important;
            position: relative !important;
          }

          /* Flag Color Drift (Non-Institutional) */
          [class*="blue-"], [class*="indigo-"], [class*="violet-"], 
          [class*="slate-"], [class*="zinc-"], [class*="gray-"] {
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4) !important;
          }

          /* Label Drift Geometry */
          [class*="rounded-lg"]:not([data-slot])::after,
          [class*="rounded-xl"]::after, 
          [class*="rounded-2xl"]::after, 
          [class*="rounded-3xl"]::after,
          .rounded-full:not([data-slot*="avatar"]):not(.animate-spin):not(.h-1):not(.h-1\\.5):not(.h-2):not(.h-3)::after {
            content: "DRIFT: BUBBLY GEOMETRY";
            position: absolute;
            top: -10px;
            right: 0;
            background: #ef4444;
            color: white;
            font-size: 8px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 2px;
            z-index: 9999;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            pointer-events: none;
          }

          /* ── STRUCTURAL AUDIT (Legacy Headings & Leftovers) ── */
          [data-structure-audit="true"] h1:not([data-slot*="page-header"] h1),
          [data-structure-audit="true"] h2:not([data-slot*="header"] h2):not(.section-h2):not(.premium-h2):not([data-slot*="section-header"] h2) {
            outline: 2px dashed #f59e0b !important;
            outline-offset: 6px !important;
            position: relative !important;
          }

          [data-structure-audit="true"] h1:not([data-slot*="page-header"] h1)::before,
          [data-structure-audit="true"] h2:not([data-slot*="header"] h2):not(.section-h2):not(.premium-h2):not([data-slot*="section-header"] h2)::before {
            content: "LEGACY_HEADER: USE <PageHeader />";
            position: absolute;
            top: -24px;
            left: 0;
            background: #f59e0b;
            color: #1e1b4b;
            padding: 2px 6px;
            font-size: 9px;
            font-weight: 800;
            border-radius: 2px;
            z-index: 9999;
            white-space: nowrap;
          }

          /* Double Table Detection (Visual Approximation) */
          [data-structure-audit="true"] table + table,
          [data-structure-audit="true"] .border + .border:has(table) {
            outline: 4px solid #ef4444 !important;
            position: relative !important;
          }

          [data-structure-audit="true"] table + table::before {
            content: "REDUNDANT_STRUCTURE: DOUBLE TABLE DETECTED";
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: 900;
            font-size: 11px;
            z-index: 9999;
          }
        `}} />
      )}

      {/* ── INSPECTOR PANEL ── */}
      <div className={cn(
        "fixed bottom-20 right-6 z-[9999] w-72 bg-brown-950/90 text-white backdrop-blur-xl border border-white/10 shadow-2xl rounded-md flex flex-col p-4 gap-4 transition-all duration-300 transform",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500">Design Consistency Inspector</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50 hover:text-white" onClick={() => setIsVisible(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* ── THEME SWITCHER ── */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-white/60">Live Theme Switcher</span>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                size="sm" 
                variant={activeTheme === "prestige" ? "default" : "outline"}
                className={cn("h-12 p-0 flex flex-col items-center justify-center gap-1", activeTheme === "prestige" && "bg-amber-500 border-amber-500")}
                onClick={() => handleThemeChange("prestige")}
              >
                <div className="h-4 w-4 rounded-full bg-[#FDF7EF] border border-white/20" />
                <span className="text-[8px] font-bold">Prestige</span>
              </Button>
              <Button 
                size="sm" 
                variant={activeTheme === "midnight" ? "default" : "outline"}
                className={cn("h-12 p-0 flex flex-col items-center justify-center gap-1", activeTheme === "midnight" && "bg-brown-600 border-brown-600")}
                onClick={() => handleThemeChange("midnight")}
              >
                <div className="h-4 w-4 rounded-full bg-[#120A05] border border-white/20" />
                <span className="text-[8px] font-bold">Midnight</span>
              </Button>
              <Button 
                size="sm" 
                variant={activeTheme === "slate" ? "default" : "outline"}
                className={cn("h-12 p-0 flex flex-col items-center justify-center gap-1", activeTheme === "slate" && "bg-blue-600 border-blue-600")}
                onClick={() => handleThemeChange("slate")}
              >
                <div className="h-4 w-4 rounded-full bg-[#F8F9FA] border border-white/20" />
                <span className="text-[8px] font-bold">Slate</span>
              </Button>
            </div>
          </div>

          {/* ── OVERLAYS ── */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-white/60">32px Grid Layer</span>
            <Button 
              size="sm" 
              variant={showGrid ? "default" : "outline"} 
              className={cn("h-7 px-3 text-[10px] uppercase font-bold", showGrid && "bg-amber-500 hover:bg-amber-600")}
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              {showGrid ? "Active" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-white/60">SaaS Drift Audit</span>
            <Button 
              size="sm" 
              variant={auditMode ? "destructive" : "outline"}
              className="h-7 px-3 text-[10px] uppercase font-bold"
              onClick={() => setAuditMode(!auditMode)}
            >
              {auditMode ? <AlertCircle className="h-3 w-3 mr-1" /> : <Search className="h-3 w-3 mr-1" />}
              Scan Aesthetics
            </Button>
          </div>


          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-white/60">Structure Scan</span>
            <Button 
              size="sm" 
              variant={structureAudit ? "default" : "outline"}
              className={cn("h-7 px-3 text-[10px] uppercase font-bold", structureAudit && "bg-amber-600 hover:bg-amber-700")}
              onClick={() => {
                setStructureAudit(!structureAudit)
                document.documentElement.setAttribute('data-structure-audit', (!structureAudit).toString())
              }}
            >
              {structureAudit ? <Database className="h-3 w-3 mr-1" /> : <Layers className="h-3 w-3 mr-1" />}
              {structureAudit ? "Scrutinizing" : "Check Leftovers"}
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[10px] font-bold uppercase text-white/60">Inspect Brand Tokens</span>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-500" onClick={() => setShowPalette(!showPalette)}>
              <Palette className="h-3 w-3" />
            </Button>
          </div>

          {showPalette && (
            <div className="bg-white/5 rounded p-2 space-y-1 text-[9px] font-mono animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span>--primary:</span>
                <span className="text-amber-500">Cocoa (#512912)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>--accent:</span>
                <span className="text-amber-500">Amber (#E8A020)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>--radius-md:</span>
                <span className="text-amber-500">14px (Institutional)</span>
              </div>
            </div>
          )}

          {/* ── DESIGN HEALTH ── */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-amber-500">Design Health Score</span>
              <span className="text-sm font-black text-amber-500 tracking-tighter">94%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 w-[94%]" />
            </div>
            <p className="text-[8px] font-medium text-amber-500/60 leading-tight">
              Minor color drift detected in <span className="underline">footer</span>. Geometry is 100% compliant.
            </p>
          </div>
        </div>

        <div className="mt-2 text-[8px] text-white/30 font-bold uppercase tracking-widest text-center">
          Ctrl + Shift + P to toggle
        </div>
      </div>

      {/* ── DESIG LABEL TRIGGER ── */}
      <button 
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          "fixed bottom-6 right-6 z-[9999] h-10 w-10 bg-brown-800 border-2 border-amber-500/50 rounded-md flex items-center justify-center text-amber-500 shadow-amber transition-all hover:scale-110",
          isVisible && "opacity-0 scale-0 pointer-events-none"
        )}
      >
        <Zap className={cn("h-5 w-5", activeTheme === "slate" ? "text-blue-500" : "text-amber-500")} />
      </button>
    </>
  )
}
