"use client"

import * as React from"react"
import { Eye, EyeOff, Check, X } from"lucide-react"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { cn } from"@/lib/utils"
import { checkPasswordStrength } from"@/lib/validators"

export interface PasswordInputProps
 extends React.InputHTMLAttributes<HTMLInputElement> {
 showStrength?: boolean
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
 ({ className, showStrength = false, onChange, ...props }, ref) => {
 const [showPassword, setShowPassword] = React.useState(false)
 const [strength, setStrength] = React.useState(0)
 const [requirements, setRequirements] = React.useState({
 length: false,
 uppercase: false,
 lowercase: false,
 number: false,
 special: false,
 })

 const calculateStrength = (value: string) => {
 const { score, requirements: newRequirements } = checkPasswordStrength(value)
 setRequirements(newRequirements)
 setStrength(score)
 }

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
 <Button
 type="button"
 variant="ghost"
 size="sm"
 className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
 onClick={() => setShowPassword(!showPassword)}
 >
 {showPassword ? (
 <EyeOff className="h-4 w-4 text-muted-foreground" />
 ) : (
 <Eye className="h-4 w-4 text-muted-foreground" />
 )}
 <span className="sr-only">
 {showPassword ?"Hide password" :"Show password"}
 </span>
 </Button>
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

 <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
 <div
 className={cn("h-full transition-all duration-300 ease-out", getStrengthColor(strength))}
 style={{ width: `${strength}%` }}
 />
 </div>

 <div className="grid grid-cols-2 gap-1.5 mt-2">
 <RequirementItem label="Min 8 chars" met={requirements.length} />
 <RequirementItem label="Uppercase" met={requirements.uppercase} />
 <RequirementItem label="Lowercase" met={requirements.lowercase} />
 <RequirementItem label="Number" met={requirements.number} />
 <RequirementItem label="Symbol" met={requirements.special} />
 </div>
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
