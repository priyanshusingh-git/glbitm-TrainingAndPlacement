"use client"

import * as React from"react"
import { Eye, EyeOff, Check, X, ShieldAlert, ShieldCheck, Loader2, AlertCircle } from"lucide-react"
import { Input } from"@/components/ui/input"
import { api } from"@/lib/api"
import { getAuthErrorMessage } from"@/lib/auth-ui-messages"
import { cn } from"@/lib/utils"
import { checkPasswordStrength } from"@/lib/validators"

export interface PasswordInputProps
 extends React.InputHTMLAttributes<HTMLInputElement> {
 showStrength?: boolean
 showBreachCheck?: boolean
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
 ({ className, showStrength = false, showBreachCheck = false, onChange, value, ...props }, ref) => {
 const [showPassword, setShowPassword] = React.useState(false)
 const [strength, setStrength] = React.useState(0)
 const [requirements, setRequirements] = React.useState({
 length: false,
 uppercase: false,
 lowercase: false,
 number: false,
 special: false,
 })
 const [breachStatus, setBreachStatus] = React.useState<"idle" | "checking" | "safe" | "breached" | "unavailable">("idle")
 const [breachMessage, setBreachMessage] = React.useState("")

 const calculateStrength = (value: string) => {
 const { score, requirements: newRequirements } = checkPasswordStrength(value)
 setRequirements(newRequirements)
 setStrength(score)
 }

 React.useEffect(() => {
 const rawValue = typeof value === "string" ? value : ""

 if (!showBreachCheck) {
 setBreachStatus("idle")
 setBreachMessage("")
 return
 }

 if (rawValue.length < 8) {
 setBreachStatus("idle")
 setBreachMessage("")
 return
 }

 let active = true
 setBreachStatus("checking")
 setBreachMessage("Checking breached-password database...")

 const timer = window.setTimeout(async () => {
 try {
 const response = await api.post("/auth/password-check", { password: rawValue }, { skipRedirect: true })
 if (!active) return

 setBreachStatus(response.breached ? "breached" : "safe")
 setBreachMessage(response.message)
 } catch (error: any) {
 if (!active) return

 const message = getAuthErrorMessage(error, { flow: "change-password" })
 setBreachStatus(error?.code === "PASSWORD_CHECK_UNAVAILABLE" ? "unavailable" : "idle")
 setBreachMessage(message)
 }
 }, 700)

 return () => {
 active = false
 window.clearTimeout(timer)
 }
 }, [showBreachCheck, value])

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (showStrength) {
 calculateStrength(e.target.value)
 }
 if (onChange) {
 onChange(e)
 }
 }

 const getStrengthColor = (score: number) => {
 if (score <= 20) return"bg-red-500"
 if (score <= 40) return"bg-orange-500"
 if (score <= 60) return"bg-yellow-500"
 if (score <= 80) return"bg-blue-500"
 return"bg-green-500"
 }

 const getStrengthLabel = (score: number) => {
 if (score <= 20) return"Very Weak"
 if (score <= 40) return"Weak"
 if (score <= 60) return"Fair"
 if (score <= 80) return"Good"
 return"Strong"
 }

 return (
 <div className="space-y-2">
 <div className="relative">
 <Input
 type={showPassword ?"text" :"password"}
 className={cn("pr-10", className)}
 ref={ref}
 onChange={handleChange}
 {...props}
 />
 <button
 type="button"
 className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-lg border-0 bg-transparent px-3 text-brown-400 shadow-none transition-colors hover:bg-transparent hover:text-brown-800 focus-visible:outline-none"
 onClick={() => setShowPassword(!showPassword)}
 >
 {showPassword ? (
 <EyeOff className="h-4 w-4" />
 ) : (
 <Eye className="h-4 w-4" />
 )}
 <span className="sr-only">
 {showPassword ?"Hide password" :"Show password"}
 </span>
 </button>
 </div>

 {showStrength && (
 <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
 <div className="flex justify-between items-center mb-1">
 <span className="text-xs font-medium text-muted-foreground">
 Password Strength
 </span>
 <span className={cn("text-xs font-semibold",
 strength <= 20 ?"text-red-500" :
 strength <= 40 ?"text-orange-500" :
 strength <= 60 ?"text-yellow-500" :
 strength <= 80 ?"text-blue-500" :"text-green-500"
 )}>
 {getStrengthLabel(strength)}
 </span>
 </div>

 <progress
 className={cn("password-strength-progress h-1.5 w-full overflow-hidden rounded-full bg-muted", getStrengthColor(strength))}
 max={100}
 value={strength}
 />

 <div className="grid grid-cols-2 gap-1.5 mt-2">
 <RequirementItem label="Min 8 chars" met={requirements.length} />
 <RequirementItem label="Uppercase" met={requirements.uppercase} />
 <RequirementItem label="Lowercase" met={requirements.lowercase} />
 <RequirementItem label="Number" met={requirements.number} />
 <RequirementItem label="Symbol" met={requirements.special} />
 </div>

 {showBreachCheck && breachStatus !== "idle" && (
 <div
 className={cn(
 "mt-2 flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
 breachStatus === "checking" && "border-brown-200 bg-brown-50 text-brown-700",
 breachStatus === "safe" && "border-emerald-200 bg-emerald-50 text-emerald-700",
 breachStatus === "breached" && "border-red-200 bg-red-50 text-red-700",
 breachStatus === "unavailable" && "border-amber-200 bg-amber-50 text-amber-700"
 )}
 >
 {breachStatus === "checking" && <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin" />}
 {breachStatus === "safe" && <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
 {breachStatus === "breached" && <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
 {breachStatus === "unavailable" && <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
 <span>{breachMessage}</span>
 </div>
 )}
 </div>
 )}
 </div>
 )
 }
)
PasswordInput.displayName ="PasswordInput"

const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
 <div className="flex items-center gap-1.5">
 {met ? (
 <Check className="h-3 w-3 text-green-500 shrink-0" />
 ) : (
 <X className="h-3 w-3 text-muted-foreground/40 shrink-0" />
 )}
 <span className={cn("text-[10px]", met ?"text-green-600 font-medium" :"text-muted-foreground")}>
 {label}
 </span>
 </div>
)
