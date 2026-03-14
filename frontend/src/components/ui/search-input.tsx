"use client"

import * as React from"react"
import { Input } from"@/components/ui/input"
import { Search, X } from"lucide-react"
import { Button } from"@/components/ui/button"
import { cn } from"@/lib/utils"

interface SearchInputProps extends Omit<React.ComponentProps<typeof Input>,"type"> {
 onClear?: () => void
 showClearButton?: boolean
 debounceMs?: number
 onSearchChange?: (value: string) => void
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
 (
 { className, onClear, showClearButton = true, debounceMs = 300, onSearchChange, ...props },
 ref
 ) => {
 const [value, setValue] = React.useState(props.value?.toString() || props.defaultValue?.toString() ||"")
 const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

 React.useEffect(() => {
 if (onSearchChange) {
 if (timeoutRef.current) {
 clearTimeout(timeoutRef.current)
 }
 timeoutRef.current = setTimeout(() => {
 onSearchChange(value)
 }, debounceMs)
 return () => {
 if (timeoutRef.current) {
 clearTimeout(timeoutRef.current)
 }
 }
 }
 }, [value, debounceMs, onSearchChange])

 const handleClear = () => {
 setValue("")
 if (onClear) {
 onClear()
 }
 if (onSearchChange) {
 onSearchChange("")
 }
 }

 return (
 <div className="relative">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
 <Input
 ref={ref}
 type="search"
 value={value}
 onChange={(e) => {
 setValue(e.target.value)
 props.onChange?.(e)
 }}
 className={cn("pl-9 pr-9", className)}
 aria-label={props["aria-label"] ||"Search"}
 {...props}
 />
 {showClearButton && value && (
 <Button
 type="button"
 variant="ghost"
 size="icon-sm"
 className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
 onClick={handleClear}
 aria-label="Clear search"
 >
 <X className="h-4 w-4" />
 </Button>
 )}
 </div>
 )
 }
)

SearchInput.displayName ="SearchInput"
