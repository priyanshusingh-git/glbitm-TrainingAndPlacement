"use client"

import React from"react"
import { Input } from"@/components/ui/input"
import { Button } from"@/components/ui/button"
import { Search, Filter, Download, X } from"lucide-react"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import { Badge } from"@/components/ui/badge"
import {
 Sheet,
 SheetContent,
 SheetDescription,
 SheetHeader,
 SheetTitle,
 SheetTrigger,
} from"@/components/ui/sheet"
import { Label } from"@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select"

export interface FilterOption {
 label: string
 value: string
}

export interface FilterFacet {
 id: string
 title: string
 options: FilterOption[]
 value: string
 onChange: (value: string) => void
}

interface DataTableToolbarProps {
 searchQuery: string
 onSearchChange: (value: string) => void
 searchPlaceholder?: string
 facets?: FilterFacet[]
 onExport?: () => void
 onClear?: () => void
 sortOptions?: FilterOption[]
 selectedSort?: string
 onSortChange?: (value: string) => void
}

export function DataTableToolbar({
 searchQuery,
 onSearchChange,
 searchPlaceholder ="Search...",
 facets = [],
 onExport,
 onClear,
 sortOptions,
 selectedSort,
 onSortChange,
}: DataTableToolbarProps) {
 const activeFiltersCount = facets.filter(f => f.value && f.value !=="all").length;
 const isFiltered = searchQuery !=="" || activeFiltersCount > 0

 return (
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
 <div className="flex flex-1 items-center gap-2 w-full">
 <div className="relative w-full max-w-sm">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder={searchPlaceholder}
 value={searchQuery}
 onChange={(event) => onSearchChange(event.target.value)}
 className="pl-8 h-9"
 />
 </div>

 {facets.length > 0 && (
 <Sheet>
 <SheetTrigger asChild>
 <Button variant="outline" size="sm" className="h-9 border-dashed bg-card/80 hover:bg-card-hover">
 <Filter className="mr-2 h-4 w-4" />
 Filter
 {activeFiltersCount > 0 && (
 <Badge variant="secondary" className="ml-2 px-1 font-normal rounded-sm">
 {activeFiltersCount}
 </Badge>
 )}
 </Button>
 </SheetTrigger>
 <SheetContent>
 <SheetHeader>
 <SheetTitle>Advanced Filters</SheetTitle>
 <SheetDescription>
 Refine your results by selecting multiple criteria.
 </SheetDescription>
 </SheetHeader>
 <div className="py-6 space-y-6">
 {facets.map(facet => (
 <div key={facet.id} className="space-y-2">
 <Label>{facet.title}</Label>
 <Select value={facet.value} onValueChange={facet.onChange}>
 <SelectTrigger>
 <SelectValue placeholder={`Select ${facet.title}`} />
 </SelectTrigger>
 <SelectContent>
 {facet.options.map(opt => (
 <SelectItem key={opt.value} value={opt.value}>
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 ))}
 <div className="pt-4 border-t">
 <Button variant="outline" className="w-full" onClick={onClear} disabled={activeFiltersCount === 0}>
 Clear All Filters
 </Button>
 </div>
 </div>
 </SheetContent>
 </Sheet>
 )}

 {sortOptions && onSortChange && (
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" size="sm" className="h-9 border-dashed bg-card/80 hover:bg-card-hover">
 Sort
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="start" className="w-[180px]">
 <DropdownMenuLabel>Sort by</DropdownMenuLabel>
 <DropdownMenuSeparator />
 {sortOptions.map((option) => (
 <DropdownMenuItem
 key={option.value}
 onClick={() => onSortChange(option.value)}
 className={selectedSort === option.value ?"bg-muted font-medium" :""}
 >
 {option.label}
 </DropdownMenuItem>
 ))}
 </DropdownMenuContent>
 </DropdownMenu>
 )}
 </div>

 {onExport && (
 <Button variant="outline" size="sm" className="ml-auto h-9 bg-card/80 hover:bg-card-hover" onClick={onExport}>
 <Download className="mr-2 h-4 w-4" />
 Export CSV
 </Button>
 )}
 </div>

 {/* Active Filter Chips */}
 {activeFiltersCount > 0 && (
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-sm text-muted-foreground mr-1">Active Filters:</span>
 {facets.map(facet => {
 if (facet.value && facet.value !=="all") {
 const selectedOption = facet.options.find(o => o.value === facet.value);
 return (
 <Badge key={facet.id} variant="secondary" className="gap-1 border border-border/60 bg-card px-3 py-1 text-foreground">
 <span className="text-muted-foreground">{facet.title}:</span>
 <span>{selectedOption?.label}</span>
 <button
 onClick={() => facet.onChange("all")}
 className="ml-1 rounded-full p-0.5 hover:bg-muted/40 focus:outline-none"
 >
 <X className="h-3 w-3" />
 </button>
 </Badge>
 )
 }
 return null;
 })}
 <Button variant="ghost" size="sm" onClick={onClear} className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
 Clear filters
 </Button>
 </div>
 )}
 </div>
 )
}
