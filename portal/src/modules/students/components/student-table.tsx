"use client"

import { useState, useEffect } from"react"
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Badge } from"@/components/ui/badge"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from"@/components/ui/avatar"
import { Search, Filter, MoreHorizontal, Users, Download, Loader2 } from"lucide-react"
import { getAllStudents, Student } from"@/services/student.client"

export function StudentTable() {
 const [students, setStudents] = useState<Student[]>([])
 const [loading, setLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState("")
 const [departmentFilter, setDepartmentFilter] = useState("all")
 const [statusFilter, setStatusFilter] = useState("all")

 useEffect(() => {
 const fetchStudents = async () => {
 try {
 const data = await getAllStudents();
 setStudents(data);
 } catch (error) {
 console.error("Failed to fetch students", error);
 } finally {
 setLoading(false);
 }
 };
 fetchStudents();
 }, []);

 const filteredStudents = (students || []).filter((student) => {
 if (!student) return false;

 const matchesSearch =
 (student.name ||"").toLowerCase().includes(searchQuery.toLowerCase()) ||
 (student.user?.email ||"").toLowerCase().includes(searchQuery.toLowerCase()) // Added optional chaining for user

 const matchesDepartment =
 departmentFilter ==="all" || student.branch === departmentFilter

 // Status Logic - simplified/mocked for now as it's not directly on student object
 const status ="eligible"; // Default
 const matchesStatus =
 statusFilter ==="all" || status === statusFilter

 return matchesSearch && matchesDepartment && matchesStatus
 })

 const getStatusBadge = (status: string) => {
 switch (status) {
 case"placed":
 return <Badge className="bg-success text-success-foreground">Placed</Badge>
  case "eligible":
    return <Badge className="bg-primary/10 text-primary border-primary/20">Eligible</Badge>
 case"not-eligible":
 return (
 <Badge variant="secondary" className="text-muted-foreground">
 Not Eligible
 </Badge>
 )
 default:
 return <Badge variant="outline">{status}</Badge>
 }
 }

 const getInitials = (name: string) => {
 return name
 .split(' ')
 .map(n => n[0])
 .join('')
 .toUpperCase()
 .slice(0, 2);
 }

 return (
 <Card className="overflow-hidden border-border/50 bg-card">
 <CardHeader className="flex flex-col gap-4 border-b border-border/50 bg-muted/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
  <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
    <div className="rounded-md bg-primary/10 p-2">
      <Users className="h-5 w-5 text-primary" />
    </div>
    Student Management
  </CardTitle>
 <Button size="sm">
 <Download className="mr-2 h-4 w-4" />
 Export Data
 </Button>
 </CardHeader>
 <CardContent className="p-5">
 {/* Filters */}
 <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input
 placeholder="Search students..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9"
 />
 </div>
        <div className="flex flex-1 gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="flex-1 min-w-[100px]">
              <Filter className="mr-2 h-4 w-4 shrink-0" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dept</SelectItem>
              <SelectItem value="CSE">CSE</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="ECE">ECE</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 min-w-[100px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="eligible">Eligible</SelectItem>
              <SelectItem value="placed">Placed</SelectItem>
              <SelectItem value="not-eligible">Not Eligible</SelectItem>
            </SelectContent>
          </Select>
        </div>
 </div>

 {/* Table */}
        <div className="overflow-x-auto -mx-5 px-5">
          <Table className="min-w-[640px]">
 <TableHeader>
 <TableRow>
 <TableHead>Student</TableHead>
 <TableHead>Student ID</TableHead>
 <TableHead>Department</TableHead>
 <TableHead>Training Level</TableHead>
 <TableHead>Avg Score</TableHead>
 <TableHead>Status</TableHead>
 <TableHead className="w-12"></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={6} className="h-24 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      </TableCell>
    </TableRow>
 ) : filteredStudents.length === 0 ? (
 <TableRow>
 <TableCell colSpan={6} className="h-24 text-center">
 No students found.
 </TableCell>
 </TableRow>
 ) : (
 filteredStudents.map((student) => (
 <TableRow key={student.id}>
 <TableCell>
 <div className="flex items-center gap-3">
  <Avatar className="h-9 w-9">
    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
      {getInitials(student.name ||"Student")}
    </AvatarFallback>
  </Avatar>
 <div>
 <p className="font-medium">{student.name ||"Unknown Student"}</p>
 <p className="text-sm text-muted-foreground">
 {student.user?.email ||"No Email"}
 </p>
 </div>
 </div>
 </TableCell>
  <TableCell>
    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-primary">
      {student.admissionId ||"N/A"}
    </code>
  </TableCell>
 <TableCell>
 <Badge variant="outline">{student.branch ||"N/A"}</Badge>
 </TableCell>
 <TableCell>Level {student.currentSemester || 1}</TableCell>
 <TableCell>
 <span className="font-medium">
 {student.cgpa ? `${student.cgpa} CGPA` :"N/A"}
 </span>
 </TableCell>
 <TableCell>{getStatusBadge("eligible")}</TableCell>
 <TableCell>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-8 w-8">
 <MoreHorizontal className="h-4 w-4" />
 <span className="sr-only">Actions</span>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem>View Profile</DropdownMenuItem>
 <DropdownMenuItem>Edit Student</DropdownMenuItem>
 <DropdownMenuItem>View Test Results</DropdownMenuItem>
 <DropdownMenuItem>Send Notification</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </Table>
 </div>

 {/* Pagination Info */}
 <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
 <p>
 Showing {filteredStudents.length} of {students.length} students
 </p>
 <div className="flex gap-2">
 <Button variant="outline" size="sm" disabled>
 Previous
 </Button>
 <Button variant="outline" size="sm">
 Next
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 )
}
