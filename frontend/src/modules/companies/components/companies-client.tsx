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
 <Label>Company Name</Label>
 <Input name="name" value={formData.name} onChange={handleInputChange} />
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
 <Card key={company.id}>
 <CardHeader>
 <CardTitle>{company.name}</CardTitle>
 </CardHeader>
 </Card>
 ))}
 </div>
 )}
 </div>
 )
}
