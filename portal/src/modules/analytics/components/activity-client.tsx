"use client"

import { useEffect, useState } from"react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import {
  Activity,
  User as UserIcon,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  UserCircle,
  Info,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert
} from "lucide-react"
import { LoadingTable } from"@/components/ui/loading-states"
import { EnhancedEmpty } from"@/components/ui/enhanced-empty"
import { api } from"@/lib/api"
import { format } from"date-fns"
import { cn } from"@/lib/utils"

interface AuditLog {
 id: string
 action: string
 entityType: string
 entityId: string | null
 performedById: string
 createdAt: string
 details: any
 performedBy: {
 name: string | null
 email: string
 role: string
 }
}

export default function ActivityClient() {
 const [logs, setLogs] = useState<AuditLog[]>([])
 const [loading, setLoading] = useState(true)
 const [total, setTotal] = useState(0)
 const [page, setPage] = useState(0)
 const limit = 20

 useEffect(() => {
 fetchLogs()
 }, [page])

 const fetchLogs = async () => {
 try {
 setLoading(true)
 const data = await api.get(`/admin/activity?limit=${limit}&offset=${page * limit}`)
 setLogs(data.logs)
 setTotal(data.total)
 } catch (error) {
 console.error("Failed to fetch logs:", error)
 } finally {
 setLoading(false)
 }
 }

 const getActionIcon = (action: string) => {
 switch (action) {
 case 'CREATE': return <CheckCircle2 className="h-4 w-4 text-green-500" />
 case 'UPDATE': return <Info className="h-4 w-4 text-blue-500" />
 case 'DELETE': return <XCircle className="h-4 w-4 text-red-500" />
 case 'LOCK': return <ShieldAlert className="h-4 w-4 text-orange-500" />
 case 'UNLOCK': return <ShieldAlert className="h-4 w-4 text-green-500" />
 default: return <Activity className="h-4 w-4 text-muted-foreground" />
 }
 }

 const getEntityColor = (type: string) => {
 switch (type) {
 case 'STUDENT': return 'bg-brown-800/10 text-brown-800 border-brown-800/20'
 case 'COMPANY': return 'bg-accent/10 text-accent border-accent/20'
 case 'TRAINER': return 'bg-warning/10 text-warning border-warning/20'
 case 'USER': return 'bg-muted/15 text-muted-foreground border-border/60'
 default: return 'bg-muted/15 text-muted-foreground border-border/60'
 }
 }

 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
 <p className="text-muted-foreground">
 Track administrative actions and system updates.
 </p>
 </div>
 </div>

 <Card className="border-border/50 shadow-sm">
 <CardHeader className="pb-3 flex flex-row items-center justify-between">
 <div>
 <CardTitle className="text-lg">Platform Activity</CardTitle>
 <CardDescription>All administrative actions across the portal.</CardDescription>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 <div className="relative w-full overflow-auto">
 <table className="w-full caption-bottom text-sm">
 <thead className="[&_tr]:border-b bg-muted/10">
 <tr className="border-b border-border/70 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted/30">
 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Performed By</th>
 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Entity</th>
 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Details</th>
 <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date & Time</th>
 </tr>
 </thead>
 <tbody className="[&_tr:last-child]:border-0">
 {loading ? (
 <tr>
 <td colSpan={5} className="p-0">
 <LoadingTable rows={10} cols={5} />
 </td>
 </tr>
 ) : logs.length === 0 ? (
 <tr>
 <td colSpan={5} className="h-24 text-center">
            <EnhancedEmpty
              icon={Search}
              title="No activity found"
 description="No administrative actions have been logged yet."
 variant="minimal"
 />
 </td>
 </tr>
 ) : (
 logs.map((log) => (
 <tr key={log.id} className="border-b border-border/70 transition-colors hover:bg-muted/30 data-[state=selected]:bg-muted/30">
 <td className="p-4 align-middle">
 <div className="flex items-center gap-2">
 {getActionIcon(log.action)}
 <span className="font-medium">{log.action}</span>
 </div>
 </td>
 <td className="p-4 align-middle">
 <div className="flex flex-col">
 <span className="font-medium text-foreground">{log.performedBy?.name ||"System"}</span>
 <span className="text-xs text-muted-foreground">{log.performedBy?.email}</span>
 </div>
 </td>
 <td className="p-4 align-middle">
 <Badge variant="outline" className={cn("font-medium", getEntityColor(log.entityType))}>
 {log.entityType}
 </Badge>
 </td>
 <td className="p-4 align-middle">
 <span className="text-muted-foreground text-xs font-mono truncate max-w-[200px] block">
 {JSON.stringify(log.details)}
 </span>
 </td>
 <td className="p-4 align-middle whitespace-nowrap">
 <div className="flex flex-col">
 <span className="font-medium text-foreground">{format(new Date(log.createdAt),"MMM d, yyyy")}</span>
 <span className="text-xs text-muted-foreground font-mono">{format(new Date(log.createdAt),"HH:mm:ss")}</span>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
 <div className="text-sm text-muted-foreground">
 Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} events
 </div>
 <div className="flex items-center space-x-2">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setPage(p => Math.max(0, p - 1))}
 disabled={page === 0 || loading}
 className="h-8 w-8 p-0"
 >
 <ChevronLeft className="h-4 w-4" />
 </Button>
 <span className="text-sm font-medium">Page {page + 1}</span>
 <Button
 variant="outline"
 size="sm"
 onClick={() => setPage(p => p + 1)}
 disabled={(page + 1) * limit >= total || loading}
 className="h-8 w-8 p-0"
 >
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 )
}
