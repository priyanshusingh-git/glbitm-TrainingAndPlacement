"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LoadingTable } from "@/components/ui/loading-states"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  UserPlus, Building2, Mail, MoreHorizontal,
  Copy, Loader2, Trash2, CheckCircle2, ShieldOff,
  Users, Shield,
} from "lucide-react"

interface Recruiter {
  id: string
  name: string
  email: string
  createdAt: string
  isSuspended: boolean
  mustChangePassword: boolean
  company: {
    id: string
    name: string
    industry?: string
    status: string
  } | null
}

interface Company {
  id: string
  name: string
  industry?: string
  status: string
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
}

export default function RecruitersClient() {
  const { toast } = useToast()
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)
  const [credentialsOpen, setCredentialsOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyId: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [recruitersData, companiesData] = await Promise.all([
        api.get("/recruiters"),
        api.get("/companies"),
      ])
      setRecruiters(recruitersData)
      setCompanies(companiesData)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load recruiters", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" })
      return
    }
    try {
      setSubmitting(true)
      const res = await api.post("/recruiters", formData)
      toast({ title: "Recruiter created", description: res.warning || "Account created and welcome email sent." })
      setCreateOpen(false)
      setFormData({ name: "", email: "", companyId: "" })
      if (res.credentials) {
        setCredentials(res.credentials)
        setCredentialsOpen(true)
      }
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create recruiter", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setDeleting(true)
      await api.delete(`/recruiters/${deleteId}`)
      toast({ title: "Recruiter deleted" })
      setDeleteId(null)
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleSuspend = async (recruiter: Recruiter) => {
    try {
      await api.patch(`/recruiters/${recruiter.id}`, {
        isSuspended: !recruiter.isSuspended,
        suspendedReason: !recruiter.isSuspended ? "Suspended by admin" : null,
      })
      toast({
        title: recruiter.isSuspended ? "Account reinstated" : "Account suspended",
      })
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const filtered = recruiters.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.company?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Manage Recruiters"
        description="Create and manage recruiter accounts. Each recruiter is linked to a company via their email address."
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add Recruiter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="font-display">Create Recruiter Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="HR Manager name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Work Email <span className="text-destructive">*</span>
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                      must match the company's registered email
                    </span>
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    placeholder="hr@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link to Company</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={val => {
                      const company = companies.find(c => c.id === val)
                      setFormData(p => ({
                        ...p,
                        companyId: val,
                        // Auto-fill email if company has one and email is empty
                        email: p.email || "",
                      }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.filter(c => c.status === 'Active').map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                          {c.industry && ` — ${c.industry}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecting a company updates its registered email to match. This is how the recruiter dashboard scopes data.
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreate} disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Input
          placeholder="Search by name, email, or company..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Table */}
      {loading ? (
        <LoadingTable rows={5} cols={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No recruiters yet"
          description="Add a recruiter account to get started. They will receive login credentials via email."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-transparent hover:bg-transparent">
                <TableHead>Recruiter</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(recruiter => (
                <TableRow key={recruiter.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-lg border border-border/60">
                        <AvatarFallback className="rounded-lg bg-brown-800/10 text-brown-800 text-xs font-bold">
                          {getInitials(recruiter.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{recruiter.name}</p>
                        <p className="text-xs text-muted-foreground">{recruiter.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {recruiter.company ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{recruiter.company.name}</p>
                          {recruiter.company.industry && (
                            <p className="text-xs text-muted-foreground">{recruiter.company.industry}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No company linked</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "w-fit text-[10px] font-bold uppercase tracking-wider",
                          recruiter.isSuspended
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "border-success/30 bg-success/10 text-success"
                        )}
                      >
                        {recruiter.isSuspended ? "Suspended" : "Active"}
                      </Badge>
                      {recruiter.mustChangePassword && (
                        <span className="text-[10px] text-amber-600 font-medium">
                          Password not set
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(recruiter.email)
                            toast({ title: "Email copied" })
                          }}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleSuspend(recruiter)}>
                          {recruiter.isSuspended
                            ? <><Shield className="mr-2 h-4 w-4" /> Reinstate Account</>
                            : <><ShieldOff className="mr-2 h-4 w-4" /> Suspend Account</>
                          }
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(recruiter.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Credentials Modal */}
      <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Account Created
            </DialogTitle>
          </DialogHeader>
          {credentials && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                A welcome email has been sent. Share these credentials if email delivery failed.
              </p>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-mono font-medium">{credentials.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Password</p>
                  <p className="text-sm font-mono font-medium">{credentials.password}</p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Email: ${credentials.email}\nPassword: ${credentials.password}`
                  )
                  toast({ title: "Credentials copied" })
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Credentials
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recruiter Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the recruiter's login and revoke their access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
