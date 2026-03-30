"use client"

import { useEffect, useState } from"react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Search, Filter, MoreHorizontal, Building2, MapPin, Globe, Phone, Mail, Plus, ExternalLink, Loader2, AlertTriangle, RotateCcw, Download } from"lucide-react"
import { LoadingGrid } from"@/components/ui/loading-states"
import { EmptyState } from"@/components/ui/empty-state"
import { DataTableToolbar } from"@/components/layout/dashboard/data-table-toolbar"
import { exportToCSV } from"@/lib/export-utils"
import { FormWizard, WizardStep } from"@/components/ui/form-wizard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
 Pagination,
 PaginationContent,
 PaginationEllipsis,
 PaginationItem,
 PaginationLink,
 PaginationNext,
 PaginationPrevious,
} from"@/components/ui/pagination"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from"@/components/ui/dialog"
import { Label } from"@/components/ui/label"
import { useToast } from"@/hooks/use-toast"
import { api } from"@/lib/api"
import { Company } from"@/types/training"
import { PageHeader } from"@/components/layout/page-header"

export default function CompaniesPage() {
 const [companies, setCompanies] = useState<Company[]>([])
 const [loading, setLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState("")
 const [statusFilter, setStatusFilter] = useState("all")
 const [sortBy, setSortBy] = useState("name-asc")
 const [currentPage, setCurrentPage] = useState(1)
 const itemsPerPage = 6
 const { toast } = useToast()

 const [isDialogOpen, setIsDialogOpen] = useState(false)
 const [formData, setFormData] = useState({
 name:"",
 industry:"",
 location:"",
 website:"",
 contactPerson:"",
 email:"",
 phone:"",
 status:"Active"
 })
 const [submitting, setSubmitting] = useState(false)
 const [fetchError, setFetchError] = useState(false)

 const isCreateFormDirty = formData.name !=="";

 useEffect(() => {
 fetchCompanies()
 }, [])

 const fetchCompanies = async () => {
 try {
 setLoading(true)
 const data = await api.get('/companies')
 setCompanies(data)
 } catch (error) {
 console.error("Failed to fetch companies:", error)
 } finally {
 setLoading(false)
 }
 }

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target
 setFormData(prev => ({ ...prev, [name]: value }))
 }

 const handleSubmit = async () => {
 try {
 setSubmitting(true)
 await api.post('/companies', formData)
 setIsDialogOpen(false)
 fetchCompanies()
 } catch (error) { } finally { setSubmitting(false) }
 }

  const addCompanySteps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Info',
      content: (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Company Name <span className="text-destructive">*</span></Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Microsoft India Pvt Ltd"
            />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              placeholder="e.g. Software, BFSI, Consulting"
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g. Bengaluru, Hyderabad"
            />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://company.com"
            />
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: 'Contact Details',
      content: (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Contact Person</Label>
            <Input
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              placeholder="HR Manager name"
            />
          </div>
          <div className="space-y-2">
            <Label>
              Official Email <span className="text-destructive">*</span>
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                (used to link recruiter login to this company)
              </span>
            </Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="hr@company.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
      )
    },
    {
      id: 'status',
      title: 'Status',
      content: (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Company Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active — currently recruiting</SelectItem>
                <SelectItem value="Inactive">Inactive — not recruiting now</SelectItem>
                <SelectItem value="Blacklisted">Blacklisted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Summary</p>
            <p><span className="font-medium">Name:</span> {formData.name || '—'}</p>
            <p><span className="font-medium">Industry:</span> {formData.industry || '—'}</p>
            <p><span className="font-medium">Email:</span> {formData.email || '—'}</p>
            <p><span className="font-medium">Contact:</span> {formData.contactPerson || '—'}</p>
          </div>
        </div>
      )
    }
  ]

 return (
 <div className="space-y-6">
 <PageHeader
 title="Recruiting Companies"
 description="Manage company database, contacts, and recruitment history."
 action={
 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
 <DialogTrigger asChild>
 <Button>
 <Plus className="mr-2 h-4 w-4" /> Add Company
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader className="p-6 pb-0">
 <DialogTitle className="text-xl font-bold">Add New Company</DialogTitle>
 <DialogDescription className="text-sm text-muted-foreground">
 Enter company details and registration info to create a new profile.
 </DialogDescription>
 </DialogHeader>
 <FormWizard
 steps={addCompanySteps}
 onComplete={handleSubmit}
 onCancel={() => setIsDialogOpen(false)}
 isSubmitting={submitting}
 />
 </DialogContent>
 </Dialog>
 }
 />

 <DataTableToolbar
 searchQuery={searchQuery}
 onSearchChange={setSearchQuery}
 onClear={() => setSearchQuery("")}
 />

 {loading ? <LoadingGrid items={6} /> : (
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map(company => (
            <Card key={company.id} className="border-border/60 hover:border-brown-800/30 hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brown-800/10">
                      <Building2 className="h-5 w-5 text-brown-800" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{company.name}</CardTitle>
                      {company.industry && (
                        <CardDescription>{company.industry}</CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider shrink-0",
                      company.status === 'Active'
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-muted text-muted-foreground"
                    )}
                  >
                    {company.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {company.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {company.location}
                    </span>
                  )}
                  {company.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {company.email}
                    </span>
                  )}
                  {company.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {company.phone}
                    </span>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Globe className="h-3 w-3" /> Website
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="text-xs text-muted-foreground">
                    {company._count?.placementDrives ?? 0} drives
                  </span>
                  {company.contactPerson && (
                    <span className="text-xs text-muted-foreground">
                      Contact: {company.contactPerson}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
 </div>
 )}
 </div>
 )
}
