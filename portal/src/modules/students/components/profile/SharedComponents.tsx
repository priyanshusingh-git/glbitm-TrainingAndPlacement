import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const LockedBadge = () => (
  <div className="flex items-center gap-1 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-lg">
    <Lock className="h-3 w-3 text-amber-600/60" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700/80">Locked</span>
  </div>
);

export const LockButton = ({ 
  onClick, 
  saving, 
  label = "Save & Lock", 
  disabled 
}: { 
  onClick: () => void; 
  saving: boolean; 
  label?: string; 
  disabled?: boolean;
}) => (
  <Button onClick={onClick} disabled={disabled || saving} size="sm" className="h-10 px-5 text-xs font-bold bg-brown-900 hover:bg-brown-800 text-white rounded-xl shadow-lg shadow-brown-900/10 transition-all active:scale-95">
    {saving ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Locking...</> : <><Lock className="mr-2 h-3.5 w-3.5" />{label}</>}
  </Button>
);

export const FieldRow = ({ 
  label, 
  children, 
  error, 
  required: req, 
  icon: Icon, 
  className 
}: { 
  label: string; 
  children: React.ReactNode; 
  error?: string; 
  required?: boolean; 
  icon?: any; 
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    <div className="flex items-center gap-2 px-0.5">
      {Icon && <Icon className="h-4 w-4 text-brown-900/50" />}
      <Label className="text-sm font-semibold text-brown-900/80 leading-none">
        {label}
        {req && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
    <div className="relative group/field">
      {children}
    </div>
    {error && (
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive/90 animate-in fade-in slide-in-from-top-1 px-1 mt-1.5">
        <AlertCircle className="h-3 w-3" />
        <span>{error}</span>
      </div>
    )}
  </div>
);
