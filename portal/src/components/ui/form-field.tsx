"use client"

import * as React from"react"
import { Label } from"@/components/ui/label"
import { Input } from"@/components/ui/input"
import { Textarea } from"@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select"
import { cn } from"@/lib/utils"
import { AlertCircle, CheckCircle2 } from"lucide-react"

interface FormFieldProps {
 label: string
 error?: string
 hint?: string
 required?: boolean
 success?: boolean
 className?: string
 children: React.ReactNode
 id?: string
}

export function FormField({
 label,
 error,
 hint,
 required,
 success,
 className,
 children,
 id,
}: FormFieldProps) {
 const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g,"-")}`
 const errorId = error ? `${fieldId}-error` : undefined
 const hintId = hint ? `${fieldId}-hint` : undefined

 return (
 <div className={cn("space-y-2", className)}>
 <Label htmlFor={fieldId} className="text-sm font-medium">
 {label}
 {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
 </Label>
 <div className="relative">
 {React.cloneElement(children as React.ReactElement<{ id?: string; className?: string;[key: string]: any }>, {
 id: fieldId,
"aria-invalid": error ?"true" :"false",
"aria-describedby": [errorId, hintId].filter(Boolean).join("") || undefined,
 className: cn(
 (children as React.ReactElement<{ className?: string }>).props.className,
 error &&"border-destructive focus-visible:ring-destructive/20",
 success &&"border-success focus-visible:ring-success/20"
 ),
 })}
 {error && (
 <div className="absolute right-3 top-1/2 -translate-y-1/2">
 <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
 </div>
 )}
 {success && !error && (
 <div className="absolute right-3 top-1/2 -translate-y-1/2">
 <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
 </div>
 )}
 </div>
 {error && (
 <p
 id={errorId}
 className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in-50"
 role="alert"
 >
 <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
 <span>{error}</span>
 </p>
 )}
 {hint && !error && (
 <p id={hintId} className="text-xs text-muted-foreground">
 {hint}
 </p>
 )}
 </div>
 )
}

interface FormInputProps extends React.ComponentProps<typeof Input> {
 label: string
 error?: string
 hint?: string
 required?: boolean
 success?: boolean
}

export function FormInput({ label, error, hint, required, success, className, ...props }: FormInputProps) {
 return (
 <FormField label={label} error={error} hint={hint} required={required} success={success}>
 <Input className={className} {...props} />
 </FormField>
 )
}

interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
 label: string
 error?: string
 hint?: string
 required?: boolean
 success?: boolean
}

export function FormTextarea({
 label,
 error,
 hint,
 required,
 success,
 className,
 ...props
}: FormTextareaProps) {
 return (
 <FormField label={label} error={error} hint={hint} required={required} success={success}>
 <Textarea className={className} {...props} />
 </FormField>
 )
}

interface FormSelectProps extends React.ComponentProps<typeof Select> {
 label: string
 error?: string
 hint?: string
 required?: boolean
 success?: boolean
 placeholder?: string
 options: { value: string; label: string }[]
}

export function FormSelect({
 label,
 error,
 hint,
 required,
 success,
 placeholder,
 options,
 ...props
}: FormSelectProps) {
 const fieldId = `select-${label.toLowerCase().replace(/\s+/g,"-")}`
 const errorId = error ? `${fieldId}-error` : undefined
 const hintId = hint ? `${fieldId}-hint` : undefined

 return (
 <div className="space-y-2">
 <Label htmlFor={fieldId} className="text-sm font-medium">
 {label}
 {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
 </Label>
 <div className="relative">
 <Select {...props}>
 <SelectTrigger
 id={fieldId}
 aria-invalid={error ?"true" :"false"}
 aria-describedby={[errorId, hintId].filter(Boolean).join("") || undefined}
 className={cn(
 error &&"border-destructive focus-visible:ring-destructive/20",
 success &&"border-success focus-visible:ring-success/20"
 )}
 >
 <SelectValue placeholder={placeholder} />
 </SelectTrigger>
 <SelectContent>
 {options.map((option) => (
 <SelectItem key={option.value} value={option.value}>
 {option.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {error && (
 <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
 <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
 </div>
 )}
 {success && !error && (
 <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
 <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
 </div>
 )}
 </div>
 {error && (
 <p
 id={errorId}
 className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in-50"
 role="alert"
 >
 <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
 <span>{error}</span>
 </p>
 )}
 {hint && !error && (
 <p id={hintId} className="text-xs text-muted-foreground">
 {hint}
 </p>
 )}
 </div>
 )
}
