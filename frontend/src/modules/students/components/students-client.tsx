"use client"

import { useEffect, useState, useMemo } from"react"
import { useRouter } from"next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Search, Filter, MoreHorizontal, User, GraduationCap, BookOpen, Shield, Download, Upload, Plus, FileSpreadsheet, Send, SearchCode, Loader2, Mail, Phone, Calendar, MapPin, Building, Trash2, Edit, Pencil, Eye, CheckCircle2, XCircle, AlertCircle, Info, Lock, Unlock, ShieldAlert, ScrollText, Award, FileText, ExternalLink, Briefcase, Globe, Code } from"lucide-react"
import { LoadingTable } from"@/components/ui/loading-states"
import { EmptyState } from"@/components/ui/empty-state"
import { DataTableToolbar } from"@/components/layout/dashboard/data-table-toolbar"
import { exportToCSV } from"@/lib/export-utils"
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
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table"
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
import { Progress } from"@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { ScrollArea } from"@/components/ui/scroll-area"
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from"@/components/ui/alert-dialog"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import { PageHeader } from"@/components/layout/page-header"
import { getImageUrl } from"@/lib/utils"

// Constants
const BRANCHES = [
"Computer Science and Engineering",
"Information Technology",
"Electronics and Communication Engineering",
"Mechanical Engineering",
"Civil Engineering",
"Electrical Engineering",
"Management Studies",
"Computer Applications"
]

const getYearOptions = () => {
 const currentYear = new Date().getFullYear()
 return Array.from({ length: 5 }, (_, i) => (currentYear + i).toString())
}

const getSemesterOptions = () => Array.from({ length: 8 }, (_, i) => i + 1)

export default function StudentsClient() {
 const router = useRouter()
 const [students, setStudents] = useState<any[]>([])
 const [itemsPerPage, setItemsPerPage] = useState<number |"all">(8)
 const [currentPage, setCurrentPage] = useState(1)
 const [loading, setLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState("")
 const [branchFilter, setBranchFilter] = useState("all")
 const [yearFilter, setYearFilter] = useState("all")
 const [statusFilter, setStatusFilter] = useState("all")
 const [sortBy, setSortBy] = useState("name-asc")
 const { toast } = useToast()

 // Reset page when filters or search change
 useEffect(() => {
 setCurrentPage(1)
 }, [searchQuery, branchFilter, yearFilter, statusFilter, itemsPerPage])

 // Import state
 const [importOpen, setImportOpen] = useState(false)
 const [importFile, setImportFile] = useState<File | null>(null)
 const [importLoading, setImportLoading] = useState(false)
 const [importProgress, setImportProgress] = useState({ step: '', progress: 0, details: '' })
 const [importResults, setImportResults] = useState<{ success: number, failed: number, errors: string[] } | null>(null)

 // Create student state
 const [createOpen, setCreateOpen] = useState(false)
 const [createLoading, setCreateLoading] = useState(false)
 const [formData, setFormData] = useState({
 admissionId:"",
 email:""
 })

 // Edit student state
 const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
 const [editOpen, setEditOpen] = useState(false)
 const [editLoading, setEditLoading] = useState(false)
 const [editFormData, setEditFormData] = useState<any>({
 name:"",
 email:"",
 admissionId:"",
 rollNo:"",
 branch:"",
 year:"",
 currentSemester:"",
 studentType:"Regular Entry",
 class10School:"",
 class10Board:"",
 class10Percentage:"",
 class10Year:"",
 class12School:"",
 class12Board:"",
 class12Percentage:"",
 class12PcmPercentage:"",
 class12MathPercentage:"",
 class12Year:"",
 diplomaInstitute:"",
 diplomaBranch:"",
 diplomaPercentage:"",
 diplomaYear:"",
 // Contact
 personalEmail:"",
 mobileNo:"",
 // Family
 fatherName:"",
 fatherMobile:"",
 fatherOccupation:"",
 motherName:"",
 motherMobile:"",
 motherOccupation:"",
 // Address - Present
 presentHouseNo:"",
 presentLocality:"",
 presentCity:"",
 presentDistrict:"",
 presentState:"",
 presentPincode:"",
 // Address - Permanent
 permanentHouseNo:"",
 permanentLocality:"",
 permanentCity:"",
 permanentDistrict:"",
 permanentState:"",
 permanentPincode:"",
 // Coding Profiles
 leetcodeId:"",
 githubId:"",
 codechefId:""
 })
 const [editSemesterResults, setEditSemesterResults] = useState<any[]>([])
 const [initialEditFormData, setInitialEditFormData] = useState<any>(null)
 const [errors, setErrors] = useState<Record<string, string>>({})

 // Delete student state
 const [deleteConfirmation, setDeleteConfirmation] = useState<{ open: boolean, id: string | null, name: string | null, admissionId: string | null }>({
 open: false,
 id: null,
 name: null,
 admissionId: null
 })
 const [deleteLoading, setDeleteLoading] = useState(false)

 // Reset password state
 const [resetPasswordConfirmation, setResetPasswordConfirmation] = useState<{ open: boolean, id: string | null, name: string | null }>({
 open: false,
 id: null,
 name: null
 })
 const [resetPasswordLoading, setResetPasswordLoading] = useState(false)

 // Multi-select and Notification state
 const [selectedStudents, setSelectedStudents] = useState<string[]>([])
 const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
 const [notificationData, setNotificationData] = useState({
 title:"",
 message:"",
 type:"info" as"info" |"warning" |"success" |"urgent",
 sendEmail: true
 })
 const [sendingNotification, setSendingNotification] = useState(false)

 // Locks Management state
 const [manageLocksOpen, setManageLocksOpen] = useState(false)
 const [lockingAction, setLockingAction] = useState<string | null>(null)

 // Portfolio View State
 const [portfolioOpen, setPortfolioOpen] = useState(false)

 const isCreateFormDirty = formData.admissionId !=="" || formData.email !=="";
 const isEditFormDirty = true; // Simplified for this context

 useEffect(() => {
 fetchStudents()
 }, [])

 const fetchStudents = async () => {
 try {
 setLoading(true)
 const data = await api.get('/students')
 setStudents(data)
 } catch (error) {
 console.error("Failed to fetch students:", error)
 toast({
 title:"Error",
 description:"Failed to load student records.",
 variant:"destructive"
 })
 } finally {
 setLoading(false)
 }
 }

 const handleImportStudents = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!importFile) return

 try {
 setImportLoading(true)
 setImportProgress({ step: 'Uploading', progress: 10, details: 'Sending file to server...' })

 const formData = new FormData()
 formData.append('file', importFile)

 const response = await api.post('/admin/students/import', formData)
 setImportResults(response)
 setImportProgress({ step: 'Completed', progress: 100, details: 'Students imported successfully' })
 fetchStudents()
 } catch (error: any) {
 toast({
 title:"Import Failed",
 description: error.message ||"An error occurred during import.",
 variant:"destructive"
 })
 } finally {
 setImportLoading(false)
 }
 }

 const handleCreateStudent = async (e: React.FormEvent) => {
 e.preventDefault()

 // Frontend Validation
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(formData.email)) {
 toast({
 title:"Invalid Email",
 description:"Please enter a valid institution email address.",
 variant:"destructive"
 });
 return;
 }

 if (formData.admissionId.length < 3) {
 toast({
 title:"Invalid ID",
 description:"Admission ID is too short.",
 variant:"destructive"
 });
 return;
 }

 try {
 setCreateLoading(true)
 await api.post('/students', {
 ...formData,
 admissionId: formData.admissionId.toUpperCase().trim()
 })
 toast({ title:"Success", description:"Student created successfully" })
 setCreateOpen(false)
 setFormData({ admissionId:"", email:"" })
 fetchStudents()
 } catch (error: any) {
 toast({ title:"Error", description: error.message ||"Failed to create student", variant:"destructive" })
 } finally {
 setCreateLoading(false)
 }
 }

 const handleEditClick = (student: any) => {
 setEditingStudentId(student.id)
 const initialData = {
 name: student.name ||"",
 email: student.user?.email ||"",
 rollNo: student.rollNo ||"",
 admissionId: student.admissionId ||"",
 branch: student.branch ||"",
 year: student.year ||"",
 currentSemester: student.currentSemester ? student.currentSemester.toString() :"",
 studentType: student.studentType ||"Regular Entry",
 // Class 10
 class10School: student.class10School ||"",
 class10Board: student.class10Board ||"",
 class10Percentage: student.class10Percentage ||"",
 class10Year: student.class10Year ||"",
 // Class 12
 class12School: student.class12School ||"",
 class12Board: student.class12Board ||"",
 class12Percentage: student.class12Percentage ||"",
 class12PcmPercentage: student.class12PcmPercentage ||"",
 class12MathPercentage: student.class12MathPercentage ||"",
 class12Year: student.class12Year ||"",
 // Diploma
 diplomaInstitute: student.diplomaInstitute ||"",
 diplomaBoard: student.diplomaBoard ||"",
 diplomaPercentage: student.diplomaPercentage ||"",
 diplomaYear: student.diplomaYear ||"",
 // Contact
 personalEmail: student.personalEmail ||"",
 mobileNo: student.mobileNo ||"",
 // Family
 fatherName: student.fatherName ||"",
 fatherMobile: student.fatherMobile ||"",
 fatherOccupation: student.fatherOccupation ||"",
 motherName: student.motherName ||"",
 motherMobile: student.motherMobile ||"",
 motherOccupation: student.motherOccupation ||"",
 // Address - Present
 presentHouseNo: student.presentHouseNo ||"",
 presentLocality: student.presentLocality ||"",
 presentCity: student.presentCity ||"",
 presentDistrict: student.presentDistrict ||"",
 presentState: student.presentState ||"",
 presentPincode: student.presentPincode ||"",
 // Address - Permanent
 permanentHouseNo: student.permanentHouseNo ||"",
 permanentLocality: student.permanentLocality ||"",
 permanentCity: student.permanentCity ||"",
 permanentDistrict: student.permanentDistrict ||"",
 permanentState: student.permanentState ||"",
 permanentPincode: student.permanentPincode ||"",
 // Coding Profiles
 leetcodeId: student.leetcodeId ||"",
 githubId: student.githubId ||"",
 codechefId: student.codechefId ||"",
 // New fields
 cgpa: student.cgpa ||""
 };

 setEditFormData(initialData);
 setInitialEditFormData(initialData);

 // Initialize semester results (1-8)
 const initialSemesters = Array.from({ length: 8 }, (_, i) => {
 const existing = student.semesterResults?.find((r: any) => r.semester === i + 1);
 return {
 semester: i + 1,
 sgpa: existing?.sgpa ||"",
 backlogs: existing?.backlogs || 0,
 credits: existing?.credits ||"",
 totalMarks: existing?.totalMarks ||"",
 obtainedMarks: existing?.obtainedMarks ||""
 };
 });
 setEditSemesterResults(initialSemesters)

 setEditOpen(true)
 setErrors({}) // Clear errors on open
 }

 const handleEditSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!editingStudentId) return

 // Validate required fields
 const validationErrors: Record<string, string> = {};
 if (!editFormData.name || editFormData.name.trim().length < 2) {
 validationErrors.name ="Full Name is required (min 2 characters)";
 }
 if (!editFormData.branch) validationErrors.branch ="Branch is required";
 if (!editFormData.year) validationErrors.year ="Passing Year is required";
 if (!editFormData.currentSemester) validationErrors.currentSemester ="Current Semester is required";
 if (editFormData.rollNo && !/^\d{13}$/.test(editFormData.rollNo)) {
 validationErrors.rollNo ="Roll No must be exactly 13 digits";
 }

 if (Object.keys(validationErrors).length > 0) {
 setErrors(validationErrors);
 toast({ title:"Validation Error", description:"Please fix errors", variant:"destructive" });
 return;
 }

 setEditLoading(true)
 try {
 const semesterResults = editSemesterResults
 .filter(sem => sem.sgpa || sem.totalMarks)
 .map(sem => ({
 semester: sem.semester,
 sgpa: sem.sgpa ? parseFloat(sem.sgpa.toString()) : null,
 backlogs: sem.backlogs ? parseInt(sem.backlogs.toString()) : 0,
 credits: sem.credits ? parseInt(sem.credits.toString()) : null,
 totalMarks: sem.totalMarks ? parseInt(sem.totalMarks.toString()) : null,
 obtainedMarks: sem.obtainedMarks ? parseInt(sem.obtainedMarks.toString()) : null
 }));

 const payload = {
 ...editFormData,
 currentSemester: editFormData.currentSemester ? parseInt(editFormData.currentSemester) : null,
 // Parse numeric fields for education
 class10Percentage: editFormData.class10Percentage ? parseFloat(editFormData.class10Percentage.toString()) : null,
 class10Year: editFormData.class10Year ? parseInt(editFormData.class10Year.toString()) : null,
 class12Percentage: editFormData.class12Percentage ? parseFloat(editFormData.class12Percentage.toString()) : null,
 class12PcmPercentage: editFormData.class12PcmPercentage ? parseFloat(editFormData.class12PcmPercentage.toString()) : null,
 class12MathPercentage: editFormData.class12MathPercentage ? parseFloat(editFormData.class12MathPercentage.toString()) : null,
 class12Year: editFormData.class12Year ? parseInt(editFormData.class12Year.toString()) : null,
 diplomaPercentage: editFormData.diplomaPercentage ? parseFloat(editFormData.diplomaPercentage.toString()) : null,
 diplomaYear: editFormData.diplomaYear ? parseInt(editFormData.diplomaYear.toString()) : null,
 semesterResults: semesterResults.length > 0 ? semesterResults : undefined
 }

 await api.put(`/students/${editingStudentId}`, payload)
 toast({ title:"Success", description:"Profile updated successfully" })
 setEditOpen(false)
 fetchStudents()
 } catch (error: any) {
 toast({ title:"Error", description: error.message ||"Failed to update", variant:"destructive" })
 } finally {
 setEditLoading(false)
 }
 }

 const handleToggleProfileLock = async (id: string, name: string, currentStatus: boolean) => {
 const newStatus = !currentStatus;
 const action = newStatus ?"Locked" :"Unlocked";
 setLockingAction(`profile-${id}`);

 try {
 await api.put(`/students/${id}`, { isProfileLocked: newStatus })
 toast({ title:"Success", description: `${action} profile for ${name}.` })
 fetchStudents()
 } catch (error: any) {
 toast({ title:"Error", description: error.message || `Failed to ${action.toLowerCase()} profile`, variant:"destructive" })
 } finally {
 setLockingAction(null);
 }
 }

 const handleLockSection = async (section: string) => {
 if (!editingStudentId) return;
 setLockingAction(`section-${section}`);
 try {
 await api.post(`/students/${editingStudentId}/lock-section`, { section });
 await fetchStudents();
 toast({ title:"Success", description: `${section} section locked.` });
 } catch (error: any) {
 toast({ title:"Error", description: error.message ||"Failed to lock", variant:"destructive" });
 } finally {
 setLockingAction(null);
 }
 }

 const handleUnlockSection = async (section: string) => {
 if (!editingStudentId) return;
 setLockingAction(`section-${section}`);
 try {
 await api.post(`/students/${editingStudentId}/unlock-section`, { section });
 await fetchStudents();
 toast({ title:"Success", description: `${section} section unlocked.` });
 } catch (error: any) {
 toast({ title:"Error", description: error.message ||"Failed to unlock", variant:"destructive" });
 } finally {
 setLockingAction(null);
 }
 }

 const handleUnlockSemester = async (semester: number) => {
 if (!editingStudentId) return;
 setLockingAction(`sem-${semester}`);
 try {
 await api.post(`/students/${editingStudentId}/unlock-semester`, { semester });
 await fetchStudents();
 toast({ title:"Success", description: `Semester ${semester} unlocked.` });
 } catch (error: any) {
 toast({ title:"Error", description: error.message ||"Failed to unlock", variant:"destructive" });
 } finally {
 setLockingAction(null);
 }
 }

 const handleLockSemester = async (semester: number) => {
 if (!editingStudentId) return;
 setLockingAction(`sem-${semester}`);
 try {
 await api.post(`/students/${editingStudentId}/lock-semester`, { semester });
 await fetchStudents();
 toast({ title:"Success", description: `Semester ${semester} locked.` });
 } catch (error: any) {
 toast({ title:"Error", description: error.message ||"Failed to lock", variant:"destructive" });
 } finally {
 setLockingAction(null);
 }
 }

 const handleResetPassword = (id: string, name: string) => {
 setResetPasswordConfirmation({ open: true, id, name })
 }

 const confirmResetPassword = async () => {
 if (!resetPasswordConfirmation.id) return
 setResetPasswordLoading(true)
 try {
 await api.post(`/students/${resetPasswordConfirmation.id}/reset-password`, {})
 toast({ title:"Success", description: `Password reset and sent to ${resetPasswordConfirmation.name}.` })
 setResetPasswordConfirmation({ open: false, id: null, name: null })
 } catch (error: any) {
 toast({ title:"Error", description: error.message ||"Failed to reset password", variant:"destructive" })
 } finally {
 setResetPasswordLoading(false)
 }
 }

 const handleDeleteClick = (id: string, name: string, admissionId: string) => {
 setDeleteConfirmation({ open: true, id, name, admissionId })
 }

 const confirmDeleteStudent = async () => {
 if (!deleteConfirmation.id) return
 setDeleteLoading(true)
 try {
 await api.delete(`/students/${deleteConfirmation.id}`)
 toast({ title:"Success", description:"Student deleted successfully" })
 fetchStudents()
 setDeleteConfirmation({ open: false, id: null, name: null, admissionId: null })
 } catch (error: any) {
 toast({ title:"Error", description: error.message ||"Failed to delete student", variant:"destructive" })
 } finally {
 setDeleteLoading(false)
 }
 }

 const validateField = (name: string, value: string) => {
 let error ="";
 switch (name) {
 case"name":
 if (!value.trim()) error ="Full Name is required.";
 else if (!/^[A-Za-z\s]+$/.test(value)) error ="Name must contain only alphabets.";
 break;
 case"rollNo":
 if (value && !/^\d{13}$/.test(value)) error ="Roll No must be 13 digits.";
 break;
 }
 setErrors((prev) => ({ ...prev, [name]: error }));
 return error;
 };

 const STUDENT_COLUMNS = [
 { key:"admissionId", label:"Student ID" },
 { key:"name", label:"Name" },
 { key:"branch", label:"Branch" },
 { key:"year", label:"Year" },
 { key:"cgpa", label:"CGPA" },
 { key:"personalEmail", label:"Email" }
 ]

 const processedStudents = useMemo(() => {
 let result = students.filter(student => {
 const studentEmail = student.user?.email || student.personalEmail ||"";
 const matchesSearch = (student.name ||"").toLowerCase().includes(searchQuery.toLowerCase()) ||
 (student.admissionId ||"").toLowerCase().includes(searchQuery.toLowerCase()) ||
 studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
 const matchesBranch = branchFilter ==="all" || student.branch === branchFilter
 const matchesYear = yearFilter ==="all" || student.year === yearFilter
 const matchesStatus = statusFilter ==="all" || (statusFilter ==="placed" ? student.cgpa > 7 : student.cgpa <= 7)
 return matchesSearch && matchesBranch && matchesYear && matchesStatus
 })

 // Sorting logic
 result.sort((a, b) => {
 switch (sortBy) {
 case"name-asc":
 return (a.name ||"").localeCompare(b.name ||"");
 case"name-desc":
 return (b.name ||"").localeCompare(a.name ||"");
 case"admissionId-asc":
 return (a.admissionId ||"").localeCompare(b.admissionId ||"");
 case"admissionId-desc":
 return (b.admissionId ||"").localeCompare(a.admissionId ||"");
 case"cgpa-desc":
 return (b.cgpa || 0) - (a.cgpa || 0);
 case"cgpa-asc":
 return (a.cgpa || 0) - (b.cgpa || 0);
 default:
 return 0;
 }
 })

 return result
 }, [students, searchQuery, branchFilter, yearFilter, statusFilter, sortBy])

 const rowsPerPage = itemsPerPage ==="all" ? processedStudents.length || 1 : itemsPerPage
 const totalPages = Math.ceil(processedStudents.length / rowsPerPage)
 const paginatedStudents = processedStudents.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

 const getInitials = (name: string) => {
 return name
 .split(' ')
 .map(n => n[0])
 .join('')
 .toUpperCase()
 .slice(0, 2);
 }

 return (
 <div className="space-y-6">
 <PageHeader
 title="Student Database"
 description="Manage student records, track placement status, and academic progress."
 action={
 <div className="flex gap-2">
 <Dialog open={importOpen} onOpenChange={setImportOpen}>
 <DialogTrigger asChild>
 <Button variant="outline">
 <Upload className="mr-2 h-4 w-4" /> Import
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Import Students</DialogTitle>
 <DialogDescription>
 Upload an Excel or CSV file to bulk import student records.
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleImportStudents} className="space-y-4 pt-4">
 <div className="grid gap-4 py-4">
 <div className="grid gap-2">
 <Label htmlFor="file">Select File (XLSX, CSV)</Label>
 <Input
 id="file"
 type="file"
 accept=".xlsx,.xls,.csv"
 onChange={(e) => setImportFile(e.target.files?.[0] || null)}
 />
 </div>
 </div>
 <DialogFooter>
 <Button type="submit" disabled={importLoading || !importFile}>
 {importLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> :"Import Students"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 <Dialog open={createOpen} onOpenChange={setCreateOpen}>
 <DialogTrigger asChild>
 <Button className="shadow-lg shadow-primary/20">
 <Plus className="mr-2 h-4 w-4" /> Add Student
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Add New Student</DialogTitle>
 <DialogDescription>Create a new student account manually.</DialogDescription>
 </DialogHeader>
 <form onSubmit={handleCreateStudent} className="space-y-4 pt-4">
 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="admissionId">Admission ID / University ID</Label>
 <Input
 id="admissionId"
 placeholder="e.g. 2021CSE001"
 value={formData.admissionId}
 onChange={e => setFormData({ ...formData, admissionId: e.target.value.toUpperCase() })}
 className="uppercase"
 required
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="email">Institute Email</Label>
 <Input
 id="email"
 type="email"
 placeholder="student@college.edu"
 value={formData.email}
 onChange={e => setFormData({ ...formData, email: e.target.value })}
 required
 />
 </div>
 </div>
 <DialogFooter>
 <Button type="submit" disabled={createLoading}>
 {createLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :"Create Student Account"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </div>
 }
 />

 <DataTableToolbar
 searchQuery={searchQuery}
 onSearchChange={setSearchQuery}
 searchPlaceholder="Search by name, ID or email..."
 facets={[
 {
 id: 'branch',
 title: 'Branch',
 options: BRANCHES.map(b => ({ label: b, value: b })),
 value: branchFilter,
 onChange: setBranchFilter
 },
 {
 id: 'year',
 title: 'Year',
 options: [
 { label:"All Years", value:"all" },
 ...getYearOptions().map(y => ({ label: `Year ${y}`, value: y }))
 ],
 value: yearFilter,
 onChange: setYearFilter
 },
 {
 id: 'status',
 title: 'Status',
 options: [
 { label:"All Status", value:"all" },
 { label:"Eligible (>7 CGPA)", value:"eligible" },
 { label:"Not Eligible (<=7 CGPA)", value:"not-eligible" }
 ],
 value: statusFilter,
 onChange: setStatusFilter
 }
 ]}
 sortOptions={[
 { label:"Name (A-Z)", value:"name-asc" },
 { label:"Name (Z-A)", value:"name-desc" },
 { label:"Student ID (Asc)", value:"admissionId-asc" },
 { label:"Student ID (Desc)", value:"admissionId-desc" },
 { label:"CGPA (High-Low)", value:"cgpa-desc" },
 { label:"CGPA (Low-High)", value:"cgpa-asc" }
 ]}
 selectedSort={sortBy}
 onSortChange={setSortBy}
 onExport={() => exportToCSV(processedStudents,"students_records", STUDENT_COLUMNS)}
 onClear={() => {
 setSearchQuery("")
 setBranchFilter("all")
 setYearFilter("all")
 setStatusFilter("all")
 setSortBy("name-asc")
 }}
 />

 {loading ? (
 <LoadingTable rows={8} cols={6} />
 ) : (
 <>
 <div className="premium-muted overflow-hidden overflow-x-auto rounded-xl border border-border/60 shadow-sm">
 <Table>
 <TableHeader>
 <TableRow className="bg-transparent hover:bg-transparent">
 <TableHead className="w-[250px]">Student</TableHead>
 <TableHead>Student ID</TableHead>
 <TableHead>Branch</TableHead>
 <TableHead>Year</TableHead>
 <TableHead>CGPA</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {paginatedStudents.length === 0 ? (
 <TableRow>
 <TableCell colSpan={6} className="h-[400px]">
 <EmptyState
 icon={User}
 title="No students found"
 description="Try adjusting your filters or search query to find what you're looking for."
 action={{
 label:"Clear all filters",
 onClick: () => {
 setSearchQuery("");
 setBranchFilter("all");
 setYearFilter("all");
 setStatusFilter("all");
 setSortBy("name-asc");
 },
 icon: Filter
 }}
 />
 </TableCell>
 </TableRow>
 ) : (
 paginatedStudents.map((student) => (
 <TableRow
 key={student.id}
 className="group border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer"
 onDoubleClick={() => router.push(`/admin/students/${student.id}/profile`)}
 >
 <TableCell>
 <div className="flex items-center gap-3">
 <Avatar className="h-9 w-9 border border-brown-800/10 shadow-sm">
 <AvatarImage src={getImageUrl(student.photoUrl)} />
 <AvatarFallback className="bg-brown-800/5 text-brown-800 text-xs font-bold">
 {getInitials(student.name ||"Student")}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-col">
 <span className="font-semibold text-sm group-hover:text-brown-800 transition-colors">
 {student.name ||"N/A"}
 </span>
 <span className="text-[11px] text-muted-foreground">
 {student.user?.email || student.personalEmail ||"No email"}
 </span>
 </div>
 </div>
 </TableCell>
 <TableCell>
 <code className="rounded bg-card-hover px-1.5 py-0.5 text-[11px] font-mono font-bold text-brown-800">
 {student.admissionId ||"N/A"}
 </code>
 </TableCell>
 <TableCell className="text-xs font-medium">
 {student.branch ||"N/A"}
 </TableCell>
 <TableCell className="text-xs">
 Year {student.year ||"N/A"}
 </TableCell>
 <TableCell>
 <Badge variant="secondary" className="font-bold text-[10px] bg-brown-800/5 text-brown-800 border-brown-800/10 uppercase">
 {student.cgpa ? `${student.cgpa} CGPA` :"N/A"}
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-8 w-8 transition-opacity">
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[180px]">
 <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Actions</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <DropdownMenuItem onClick={() => router.push(`/admin/students/${student.id}/profile`)} className="text-xs font-bold gap-2 cursor-pointer">
 <Eye className="h-3.5 w-3.5 text-blue-500" /> View Profile
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => handleEditClick(student)} className="text-xs font-bold gap-2 cursor-pointer">
 <Edit className="h-3.5 w-3.5 text-amber-500" /> Edit Record
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => { setEditingStudentId(student.id); setManageLocksOpen(true); }} className="text-xs font-bold gap-2 cursor-pointer">
 <Lock className="h-3.5 w-3.5 text-rose-500" /> Lock Management
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => handleResetPassword(student.id, student.name)} className="text-xs font-bold gap-2 cursor-pointer">
 <Send className="h-3.5 w-3.5 text-indigo-500" /> Send Password
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem
 onClick={() => handleDeleteClick(student.id, student.name, student.admissionId)}
 className="text-xs font-bold gap-2 text-rose-500 focus:text-rose-500 cursor-pointer"
 >
 <Trash2 className="h-3.5 w-3.5" /> Delete Student
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </Table>

 {/* Pagination */}
 <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 bg-card/50 px-4 py-3">
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
 Rows per page
 </span>
 <Select
 value={itemsPerPage.toString()}
 onValueChange={(value) => {
 setItemsPerPage(value ==="all" ?"all" : parseInt(value))
 setCurrentPage(1)
 }}
 >
 <SelectTrigger className="h-8 w-[70px] bg-card text-xs font-bold border-border/60">
 <SelectValue placeholder="8" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="8" className="text-xs font-bold">8</SelectItem>
 <SelectItem value="10" className="text-xs font-bold">10</SelectItem>
 <SelectItem value="20" className="text-xs font-bold">20</SelectItem>
 <SelectItem value="50" className="text-xs font-bold">50</SelectItem>
 <SelectItem value="100" className="text-xs font-bold">100</SelectItem>
 <SelectItem value="all" className="text-xs font-bold">All</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
 {processedStudents.length} Students Total
 </p>
 </div>

 {totalPages > 1 && (
 <div className="flex items-center gap-4">
 <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
 Page {currentPage} of {totalPages}
 </p>
 <Pagination className="w-auto mx-0">
 <PaginationContent>
 <PaginationPrevious
 href="#"
 onClick={(e) => { e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1)) }}
 className={currentPage === 1 ?"pointer-events-none opacity-50" :"cursor-pointer"}
 />
 <PaginationItem>
 <PaginationNext
 href="#"
 onClick={(e) => { e.preventDefault(); setCurrentPage(Math.min(totalPages, currentPage + 1)) }}
 className={currentPage === totalPages ?"pointer-events-none opacity-50" :"cursor-pointer"}
 />
 </PaginationItem>
 </PaginationContent>
 </Pagination>
 </div>
 )}
 </div>
 </div>
 </>
 )}
 {/* Edit Student Dialog (The Big One) */}
 <Dialog open={editOpen} onOpenChange={setEditOpen}>
 <DialogContent className="max-w-[calc(100vw-2rem)] md:max-w-4xl max-h-[95vh] overflow-hidden p-0 rounded-2xl border-none shadow-2xl">
 <DialogHeader>
 <DialogTitle className="text-2xl font-bold px-6 pt-6 tracking-tight">Edit Student Details</DialogTitle>
 <DialogDescription className="text-sm text-muted-foreground px-6 pb-2">
 Update student's personal and academic information.
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleEditSubmit} className="space-y-6">
 <Tabs defaultValue="basic" className="w-full">
 <TabsList className="flex w-fit bg-muted/40 p-1 rounded-full mb-6 overflow-x-auto max-w-full hide-scrollbar mx-6">
 {[
 { value: 'basic', label: 'Basic' },
 { value: 'contact', label: 'Contact' },
 { value: 'family', label: 'Family' },
 { value: 'education', label: 'Education' },
 { value: 'semesters', label: 'Semesters' }
 ].map(tab => (
 <TabsTrigger
 key={tab.value}
 value={tab.value}
 className="px-6 py-1.5 rounded-full transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground font-bold text-xs uppercase tracking-tight"
 >
 {tab.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <div className="h-[550px] overflow-y-auto px-6 pr-8 mt-4 pb-8">
 <TabsContent value="basic" className="space-y-4 pt-2">
 <div className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.name}
 onChange={e => {
 setEditFormData({ ...editFormData, name: e.target.value });
 validateField("name", e.target.value);
 }}
 className={`h-10 rounded-xl border-input ${errors.name ? 'border-rose-500' : ''}`}
 />
 {errors.name && <p className="text-[10px] font-bold text-rose-500">{errors.name}</p>}
 </div>

 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Email <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.email}
 className="h-10 rounded-xl bg-muted/30"
 disabled
 />
 </div>

 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admission ID <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.admissionId}
 onChange={e => {
 const val = e.target.value.toUpperCase();
 setEditFormData({ ...editFormData, admissionId: val });
 validateField("admissionId", val);
 }}
 className={`h-10 rounded-xl border-input ${errors.admissionId ? 'border-rose-500' : ''}`}
 />
 {errors.admissionId && <p className="text-[10px] font-bold text-rose-500">{errors.admissionId}</p>}
 </div>

 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">University Roll No <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.rollNo}
 onChange={e => {
 setEditFormData({ ...editFormData, rollNo: e.target.value });
 validateField("rollNo", e.target.value);
 }}
 placeholder="13-digit Roll Number"
 className={`h-10 rounded-xl border-input ${errors.rollNo ? 'border-rose-500' : ''}`}
 />
 {errors.rollNo && <p className="text-[10px] font-bold text-rose-500">{errors.rollNo}</p>}
 </div>

 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Type <span className="text-rose-500">*</span></Label>
 <Select
 value={editFormData.studentType}
 onValueChange={v => setEditFormData({ ...editFormData, studentType: v })}
 >
 <SelectTrigger className="h-10 rounded-xl border-input">
 <SelectValue placeholder="Select type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Regular Entry">Regular Entry</SelectItem>
 <SelectItem value="Lateral Entry">Lateral Entry</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Branch <span className="text-rose-500">*</span></Label>
 <Select
 value={editFormData.branch}
 onValueChange={v => setEditFormData({ ...editFormData, branch: v })}
 >
 <SelectTrigger className="h-10 rounded-xl border-input">
 <SelectValue placeholder="Select Branch" />
 </SelectTrigger>
 <SelectContent>
 {BRANCHES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Passing Year <span className="text-rose-500">*</span></Label>
 <Select
 value={editFormData.year}
 onValueChange={v => setEditFormData({ ...editFormData, year: v })}
 >
 <SelectTrigger className="h-10 rounded-xl border-input">
 <SelectValue placeholder="Select Year" />
 </SelectTrigger>
 <SelectContent>
 {getYearOptions().map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Semester <span className="text-rose-500">*</span></Label>
 <Select
 value={editFormData.currentSemester}
 onValueChange={v => setEditFormData({ ...editFormData, currentSemester: v })}
 >
 <SelectTrigger className="h-10 rounded-xl border-input">
 <SelectValue placeholder="Select Semester" />
 </SelectTrigger>
 <SelectContent>
 {getSemesterOptions().map(s => <SelectItem key={s} value={s.toString()}>{s}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="flex justify-end pt-4">
 <Button type="submit" disabled={editLoading} className="rounded-xl px-8 font-bold uppercase tracking-tight text-xs shadow-lg shadow-primary/20">
 {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
 Save Basic Changes
 </Button>
 </div>
 </div>
 </TabsContent>

 <TabsContent value="contact" className="space-y-4 pt-2">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Personal Email</Label>
 <Input
 type="email"
 value={editFormData.personalEmail}
 onChange={e => setEditFormData({ ...editFormData, personalEmail: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="e.g. name@gmail.com"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Number</Label>
 <Input
 value={editFormData.mobileNo}
 onChange={e => setEditFormData({ ...editFormData, mobileNo: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="10-digit mobile number"
 />
 </div>
 </div>

 <div className="space-y-4 mt-6">
 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brown-800">Present Address</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5 col-span-2">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">House / Flat No & Locality</Label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Input
 value={editFormData.presentHouseNo}
 onChange={e => setEditFormData({ ...editFormData, presentHouseNo: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="House No"
 />
 <Input
 value={editFormData.presentLocality}
 onChange={e => setEditFormData({ ...editFormData, presentLocality: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="Locality"
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</Label>
 <Input
 value={editFormData.presentCity}
 onChange={e => setEditFormData({ ...editFormData, presentCity: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="City"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">District</Label>
 <Input
 value={editFormData.presentDistrict}
 onChange={e => setEditFormData({ ...editFormData, presentDistrict: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="District"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State</Label>
 <Input
 value={editFormData.presentState}
 onChange={e => setEditFormData({ ...editFormData, presentState: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="State"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pincode</Label>
 <Input
 value={editFormData.presentPincode}
 onChange={e => setEditFormData({ ...editFormData, presentPincode: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="6-digit Pincode"
 />
 </div>
 </div>
 </div>

 <div className="space-y-4 mt-6">
 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brown-800">Permanent Address</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5 col-span-2">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">House / Flat No & Locality</Label>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Input
 value={editFormData.permanentHouseNo}
 onChange={e => setEditFormData({ ...editFormData, permanentHouseNo: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="House No"
 />
 <Input
 value={editFormData.permanentLocality}
 onChange={e => setEditFormData({ ...editFormData, permanentLocality: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="Locality"
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</Label>
 <Input
 value={editFormData.permanentCity}
 onChange={e => setEditFormData({ ...editFormData, permanentCity: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="City"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">District</Label>
 <Input
 value={editFormData.permanentDistrict}
 onChange={e => setEditFormData({ ...editFormData, permanentDistrict: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="District"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State</Label>
 <Input
 value={editFormData.permanentState}
 onChange={e => setEditFormData({ ...editFormData, permanentState: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="State"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pincode</Label>
 <Input
 value={editFormData.permanentPincode}
 onChange={e => setEditFormData({ ...editFormData, permanentPincode: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="6-digit Pincode"
 />
 </div>
 </div>
 </div>
 <div className="flex justify-end pt-4">
 <Button type="submit" disabled={editLoading} className="rounded-xl px-8 font-bold uppercase tracking-tight text-xs shadow-lg shadow-primary/20">
 {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
 Save Contact Changes
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="family" className="space-y-4 pt-2">
 <div className="space-y-6">
 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brown-800">Father's Information</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Father's Name</Label>
 <Input
 value={editFormData.fatherName}
 onChange={e => setEditFormData({ ...editFormData, fatherName: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="Full Name"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Number</Label>
 <Input
 value={editFormData.fatherMobile}
 onChange={e => setEditFormData({ ...editFormData, fatherMobile: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="10-digit number"
 />
 </div>
 <div className="space-y-1.5 col-span-2">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Occupation</Label>
 <Input
 value={editFormData.fatherOccupation}
 onChange={e => setEditFormData({ ...editFormData, fatherOccupation: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="e.g. Service, Business, Farmer"
 />
 </div>
 </div>
 </div>

 <div className="space-y-4 mt-6">
 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brown-800">Mother's Information</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mother's Name</Label>
 <Input
 value={editFormData.motherName}
 onChange={e => setEditFormData({ ...editFormData, motherName: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="Full Name"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mobile Number</Label>
 <Input
 value={editFormData.motherMobile}
 onChange={e => setEditFormData({ ...editFormData, motherMobile: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="10-digit number"
 />
 </div>
 <div className="space-y-1.5 col-span-2">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Occupation</Label>
 <Input
 value={editFormData.motherOccupation}
 onChange={e => setEditFormData({ ...editFormData, motherOccupation: e.target.value })}
 className="h-10 rounded-xl border-input"
 placeholder="e.g. Housewife, Teacher, Doctor"
 />
 </div>
 </div>
 </div>
 </div>
 <div className="flex justify-end pt-4">
 <Button type="submit" disabled={editLoading} className="rounded-xl px-8 font-bold uppercase tracking-tight text-xs shadow-lg shadow-primary/20">
 {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
 Save Family Changes
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="education" className="space-y-6 pt-2">
 <div className="space-y-6">
 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brown-800">Class 10th Details</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Name <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.class10School}
 onChange={e => setEditFormData({ ...editFormData, class10School: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Percentage (%) <span className="text-rose-500">*</span></Label>
 <Input
 type="number" step="0.01"
 value={editFormData.class10Percentage}
 onChange={e => setEditFormData({ ...editFormData, class10Percentage: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Year <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.class10Year}
 onChange={e => setEditFormData({ ...editFormData, class10Year: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 <div className="space-y-1.5 mt-4">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Board <span className="text-rose-500">*</span></Label>
 <Input
 placeholder="e.g. CBSE, ICSE, UP Board"
 value={editFormData.class10Board}
 onChange={e => setEditFormData({ ...editFormData, class10Board: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 </div>
 </div>

 <div className="h-px bg-muted" />

 <div className="space-y-4">
 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brown-800">
 {editFormData.studentType === 'Lateral Entry' ? 'Diploma Details' : 'Class 12th Details'}
 </h3>

 {editFormData.studentType === 'Lateral Entry' ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Institute <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.diplomaInstitute}
 onChange={e => setEditFormData({ ...editFormData, diplomaInstitute: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Percentage (%) <span className="text-rose-500">*</span></Label>
 <Input
 type="number" step="0.01"
 value={editFormData.diplomaPercentage}
 onChange={e => setEditFormData({ ...editFormData, diplomaPercentage: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Year <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.diplomaYear}
 onChange={e => setEditFormData({ ...editFormData, diplomaYear: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Name <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.class12School}
 onChange={e => setEditFormData({ ...editFormData, class12School: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Percentage (%) <span className="text-rose-500">*</span></Label>
 <Input
 type="number" step="0.01"
 value={editFormData.class12Percentage}
 onChange={e => setEditFormData({ ...editFormData, class12Percentage: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Year <span className="text-rose-500">*</span></Label>
 <Input
 value={editFormData.class12Year}
 onChange={e => setEditFormData({ ...editFormData, class12Year: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Board <span className="text-rose-500">*</span></Label>
 <Input
 placeholder="e.g. CBSE, ICSE"
 value={editFormData.class12Board}
 onChange={e => setEditFormData({ ...editFormData, class12Board: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diploma Board (if applicable)</Label>
 <Input
 placeholder="e.g. BTE"
 value={editFormData.diplomaBoard}
 onChange={e => setEditFormData({ ...editFormData, diplomaBoard: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">PCM %</Label>
 <Input
 type="number" step="0.01"
 value={editFormData.class12PcmPercentage}
 onChange={e => setEditFormData({ ...editFormData, class12PcmPercentage: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Math %</Label>
 <Input
 type="number" step="0.01"
 value={editFormData.class12MathPercentage}
 onChange={e => setEditFormData({ ...editFormData, class12MathPercentage: e.target.value })}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 )}
 </div>
 <div className="flex justify-end pt-4">
 <Button type="submit" disabled={editLoading} className="rounded-xl px-8 font-bold uppercase tracking-tight text-xs shadow-lg shadow-primary/20">
 {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
 Save Education Changes
 </Button>
 </div>
 </TabsContent>

 <TabsContent value="semesters" className="space-y-4 pt-2">
 <div className="p-4 rounded-xl border border-brown-800/20 bg-brown-800/5 mb-6">
 <div className="flex items-center justify-between">
 <div>
 <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown-800">Cumulative Performance</Label>
 <p className="text-xs text-muted-foreground">Overall academic CGPA across all completed semesters</p>
 </div>
 <div className="flex items-center gap-3">
 <Label className="text-sm font-bold uppercase">CGPA</Label>
 <Input
 type="number" step="0.01" placeholder="0.00"
 value={editFormData.cgpa}
 onChange={e => setEditFormData({ ...editFormData, cgpa: e.target.value })}
 className="h-11 w-28 text-center text-lg font-black border-brown-800/30 rounded-xl bg-background shadow-inner"
 />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {editSemesterResults.map((sem, idx) => (
 <div key={sem.semester} className="p-4 rounded-xl border border-input space-y-4 bg-muted/10">
 <div className="flex items-center justify-between">
 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Semester {sem.semester} <span className="text-rose-500">*</span></Label>
 <div className="space-y-1.5">
 <Input
 type="number" step="0.01" placeholder="SGPA"
 value={sem.sgpa}
 onChange={e => {
 const newResults = [...editSemesterResults];
 newResults[idx].sgpa = e.target.value;
 setEditSemesterResults(newResults);
 }}
 className="h-10 w-24 text-sm text-center font-bold rounded-xl border-input"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3 pb-2 border-b border-input/50">
 <div className="space-y-1.5">
 <Label className="text-[10px] font-bold uppercase text-muted-foreground/60">Obtained</Label>
 <Input
 type="number" placeholder="Marks"
 value={sem.obtainedMarks}
 onChange={e => {
 const newResults = [...editSemesterResults];
 newResults[idx].obtainedMarks = e.target.value;
 setEditSemesterResults(newResults);
 }}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-[10px] font-bold uppercase text-muted-foreground/60">Total</Label>
 <Input
 type="number" placeholder="Marks"
 value={sem.totalMarks}
 onChange={e => {
 const newResults = [...editSemesterResults];
 newResults[idx].totalMarks = e.target.value;
 setEditSemesterResults(newResults);
 }}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 <div className="space-y-1.5">
 <Label className="text-[10px] font-bold uppercase text-muted-foreground">Backlogs</Label>
 <Input
 type="number"
 value={sem.backlogs}
 onChange={e => {
 const newResults = [...editSemesterResults];
 newResults[idx].backlogs = e.target.value;
 setEditSemesterResults(newResults);
 }}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-[10px] font-bold uppercase text-muted-foreground">Credits</Label>
 <Input
 type="number"
 value={sem.credits}
 onChange={e => {
 const newResults = [...editSemesterResults];
 newResults[idx].credits = e.target.value;
 setEditSemesterResults(newResults);
 }}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 <div className="flex justify-end pt-4">
 <Button type="submit" disabled={editLoading} className="rounded-xl px-8 font-bold uppercase tracking-tight text-xs shadow-lg shadow-primary/20">
 {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
 Save Semester Changes
 </Button>
 </div>
 </TabsContent>
 </div>
 </Tabs>

 <DialogFooter className="px-6 py-4 border-t bg-muted/5">
 <Button
 type="button"
 variant="outline"
 onClick={() => setEditOpen(false)}
 className="rounded-xl h-10 px-6 font-bold uppercase tracking-tight text-xs"
 >
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={editLoading}
 className="min-w-[140px] rounded-xl h-10 font-bold uppercase tracking-tight text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
 >
 {editLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
 {editLoading ?"Updating..." :"Save Changes"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 {/* Manage Locks Dialog */}
 <Dialog open={manageLocksOpen} onOpenChange={setManageLocksOpen}>
 <DialogContent className="max-w-md">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <ShieldAlert className="h-5 w-5 text-rose-500" />
 Profile Access Management
 </DialogTitle>
 <DialogDescription>
 Control which sections of the profile a student can edit.
 </DialogDescription>
 </DialogHeader>
 {(() => {
 const student = students.find(s => s.id === editingStudentId);
 if (!student) return null;

 return (
 <div className="space-y-6 pt-4">
 <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-brown-800/10">
 <div className="flex items-center gap-3">
 <div className={`p-2 rounded-full ${student.isProfileLocked ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
 {student.isProfileLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
 </div>
 <div>
 <p className="text-sm font-bold uppercase tracking-wider">Profile Status</p>
 <p className="text-xs text-muted-foreground">{student.isProfileLocked ? 'Restricted Access' : 'Full Access'}</p>
 </div>
 </div>
 <Button
 size="sm"
 variant={student.isProfileLocked ?"outline" :"destructive"}
 onClick={() => handleToggleProfileLock(student.id, student.name, student.isProfileLocked)}
 disabled={lockingAction === `profile-${student.id}`}
 className="font-bold border-2"
 >
 {lockingAction === `profile-${student.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : student.isProfileLocked ?"Unlock Profile" :"Lock Profile"}
 </Button>
 </div>

 <div className="space-y-3">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Section Specific Controls</h4>
 {[
 { id: 'basic', label: 'Basic Info', locked: student.isBasicInfoLocked },
 { id: 'class10', label: 'Class 10th', locked: student.isClass10Locked },
 { id: 'class12', label: 'Class 12th', locked: student.isClass12Locked },
 { id: 'diploma', label: 'Diploma', locked: student.isDiplomaLocked }
 ].map(section => (
 <div key={section.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
 <div className="flex items-center gap-3">
 <div className={`h-1.5 w-1.5 rounded-full ${section.locked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
 <span className="text-xs font-bold">{section.label}</span>
 </div>
 <Button
 size="sm"
 variant="ghost"
 className={`h-7 px-3 text-[10px] font-bold uppercase tracking-tight ${section.locked ? 'text-emerald-600' : 'text-rose-600'}`}
 onClick={() => section.locked ? handleUnlockSection(section.id) : handleLockSection(section.id)}
 disabled={lockingAction === `section-${section.id}`}
 >
 {lockingAction === `section-${section.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : section.locked ?"Unlock" :"Lock"}
 </Button>
 </div>
 ))}
 </div>
 </div>
 );
 })()}
 </DialogContent>
 </Dialog >

 {/* Delete Confirmation */}
 < AlertDialog
 open={deleteConfirmation.open}
 onOpenChange={(open) => !deleteLoading && setDeleteConfirmation(prev => ({ ...prev, open }))
 }
 >
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle className="text-rose-500 flex items-center gap-2">
 <Trash2 className="h-5 w-5" /> Delete Student Record
 </AlertDialogTitle>
 <AlertDialogDescription>
 This will permanently delete <strong>{deleteConfirmation.name}</strong> ({deleteConfirmation.admissionId}) and all associated data. This action cannot be undone.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
 <AlertDialogAction
 onClick={(e) => { e.preventDefault(); confirmDeleteStudent(); }}
 className="bg-rose-500 hover:bg-rose-600"
 disabled={deleteLoading}
 >
 {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :"Delete Permanently"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog >

 {/* Reset Password Confirmation */}
 < AlertDialog
 open={resetPasswordConfirmation.open}
 onOpenChange={(open) => !resetPasswordLoading && setResetPasswordConfirmation(prev => ({ ...prev, open }))}
 >
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle className="text-amber-500 flex items-center gap-2">
 <Lock className="h-5 w-5" /> Reset Password?
 </AlertDialogTitle>
 <AlertDialogDescription>
 Generate a new password for <strong>{resetPasswordConfirmation.name}</strong> and send it to their institutional email.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel disabled={resetPasswordLoading}>Cancel</AlertDialogCancel>
 <AlertDialogAction
 onClick={(e) => { e.preventDefault(); confirmResetPassword(); }}
 className="bg-amber-500 hover:bg-amber-600"
 disabled={resetPasswordLoading}
 >
 {resetPasswordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :"Reset & Send Email"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog >

 {/* Portfolio View Dialog */}
 < Dialog open={portfolioOpen} onOpenChange={setPortfolioOpen} >
 <DialogContent className="max-w-[calc(100vw-2rem)] md:max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-2xl border-none shadow-2xl">
 <DialogHeader>
 <DialogTitle>Student Portfolio</DialogTitle>
 <DialogDescription>View academic and professional achievements.</DialogDescription>
 </DialogHeader>
 <div className="flex-1 overflow-hidden">
 <ScrollArea className="h-full">
 <div className="p-4 text-center text-muted-foreground py-20">
 <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
 <p className="font-bold uppercase tracking-widest text-xs">Portfolio Viewer</p>
 <p className="text-xs">Detailed portfolio data is available in the Student Profile page.</p>
 <Button
 variant="outline"
 className="mt-6 font-bold"
 onClick={() => router.push(`/admin/students/${editingStudentId}/profile`)}
 >
 Go to Full Profile
 </Button>
 </div>
 </ScrollArea>
 </div>
 </DialogContent>
 </Dialog>
 </div>
 );
};
