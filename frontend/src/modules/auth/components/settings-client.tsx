"use client"

import { useState, useEffect } from"react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { Switch } from"@/components/ui/switch"
import { Separator } from"@/components/ui/separator"
import { Bell, Shield, User, Globe, Mail, Save, Server, MessageSquare, Loader2, Database, Download, Upload } from"lucide-react"
import { useSidebar } from"@/components/layout/dashboard/dashboard-layout"
import { api } from"@/lib/api"
import { useToast } from"@/hooks/use-toast"
import { PageHeader } from"@/components/layout/page-header"

export default function SettingsPage() {
 const { expandOnHover, setExpandOnHover } = useSidebar()
 const { toast } = useToast()
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [settings, setSettings] = useState<any[]>([])

 // Group settings by category for easy access
 const getSettingValue = (key: string, defaultValue ="") => {
 return settings.find(s => s.key === key)?.value || defaultValue
 }

 const updateSettingLocal = (key: string, value: string, category: string) => {
 setSettings(prev => {
 const index = prev.findIndex(s => s.key === key)
 if (index > -1) {
 const updated = [...prev]
 updated[index] = { ...updated[index], value }
 return updated
 }
 return [...prev, { key, value, category }]
 })
 }

 useEffect(() => {
 fetchSettings()
 }, [])

 const fetchSettings = async () => {
 try {
 setLoading(true)
 const data = await api.get("/admin/settings")
 setSettings(data)
 } catch (error) {
 console.error(error)
 toast({ variant:"destructive", title:"Error", description:"Failed to load settings" })
 } finally {
 setLoading(false)
 }
 }

 const handleSave = async (category: string) => {
 try {
 setSaving(true)
 const toSave = settings.filter(s => s.category === category)
 await api.patch("/admin/settings", { settings: toSave })
 toast({ title:"Success", description: `${category} settings updated successfully` })
 } catch (error) {
 console.error(error)
 toast({ variant:"destructive", title:"Error", description:"Failed to save settings" })
 } finally {
 setSaving(false)
 }
 }

 if (loading) {
 return (
 <div className="flex h-[400px] items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-brown-800" />
 </div>
 )
 }

 return (
 <div className="space-y-6">
 <PageHeader
 title="Settings"
 description="Manage system configurations, notifications, and communications."
 />

 <Tabs defaultValue="general" className="w-full">
 <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
 <TabsList className="w-max md:w-auto">
 <TabsTrigger value="general">General</TabsTrigger>
 <TabsTrigger value="communications">Communications</TabsTrigger>
 <TabsTrigger value="academic">Academic Batch</TabsTrigger>
 <TabsTrigger value="data">Backup & Restore</TabsTrigger>
 <TabsTrigger value="security">Security</TabsTrigger>
 </TabsList>
 </div>

 <TabsContent value="general" className="space-y-6 mt-6">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Globe className="h-5 w-5" /> Platform Information
 </CardTitle>
 <CardDescription>
 General details about the CDC portal instance.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid gap-2">
 <Label htmlFor="inst-name">Institution Name</Label>
 <Input
 id="inst-name"
 value={getSettingValue("inst_name","Institute of Technology & Science")}
 onChange={(e) => updateSettingLocal("inst_name", e.target.value,"General")}
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="portal-email">Support Email</Label>
 <Input
 id="portal-email"
 value={getSettingValue("support_email","cdc-support@college.edu")}
 onChange={(e) => updateSettingLocal("support_email", e.target.value,"General")}
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="website">Website URL</Label>
 <Input
 id="website"
 value={getSettingValue("site_url","https://cdc.college.edu")}
 onChange={(e) => updateSettingLocal("site_url", e.target.value,"General")}
 />
 </div>
 </CardContent>
 <CardFooter className="border-t p-4 flex justify-end">
 <Button onClick={() => handleSave("General")} disabled={saving}>
 {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
 Save Changes
 </Button>
 </CardFooter>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Interface Settings</CardTitle>
 <CardDescription>
 Customize your dashboard experience.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between">
 <div className="space-y-0.5">
 <Label>Expand Sidebar on Hover</Label>
 <p className="text-sm text-muted-foreground">
 Automatically expand the sidebar when you hover over it.
 </p>
 </div>
 <Switch
 checked={expandOnHover}
 onCheckedChange={setExpandOnHover}
 />
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="communications" className="space-y-6 mt-6">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Server className="h-5 w-5" /> SMTP Configuration
 </CardTitle>
 <CardDescription>
 Configure the outgoing email server for system notifications.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="grid gap-2">
 <Label>SMTP Host</Label>
 <Input
 placeholder="e.g. smtp.gmail.com"
 value={getSettingValue("smtp_host")}
 onChange={(e) => updateSettingLocal("smtp_host", e.target.value,"Communications")}
 />
 </div>
 <div className="grid gap-2">
 <Label>SMTP Port</Label>
 <Input
 type="number"
 placeholder="e.g. 587 or 465"
 value={getSettingValue("smtp_port")}
 onChange={(e) => updateSettingLocal("smtp_port", e.target.value,"Communications")}
 />
 </div>
 <div className="grid gap-2">
 <Label>SMTP User (Email)</Label>
 <Input
 placeholder="noreply@college.edu"
 value={getSettingValue("smtp_user")}
 onChange={(e) => updateSettingLocal("smtp_user", e.target.value,"Communications")}
 />
 </div>
 <div className="grid gap-2">
 <Label>SMTP Password / App Key</Label>
 <Input
 type="password"
 placeholder="••••••••••••"
 value={getSettingValue("smtp_pass")}
 onChange={(e) => updateSettingLocal("smtp_pass", e.target.value,"Communications")}
 />
 </div>
 <div className="grid gap-2">
 <Label>Sender Name</Label>
 <Input
 placeholder="CDC Platform"
 value={getSettingValue("smtp_from_name")}
 onChange={(e) => updateSettingLocal("smtp_from_name", e.target.value,"Communications")}
 />
 </div>
 </div>
 </CardContent>
 <CardFooter className="border-t p-4 flex justify-end">
 <Button onClick={() => handleSave("Communications")} disabled={saving}>
 {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
 Save SMTP Config
 </Button>
 </CardFooter>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <MessageSquare className="h-5 w-5" /> SMS Provider (Beta)
 </CardTitle>
 <CardDescription>
 Configure Twilio or other SMS gateways for critical alerts.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4 opacity-50 pointer-events-none">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="grid gap-2">
 <Label>Provider</Label>
 <Input placeholder="Twilio / Fast2SMS" disabled />
 </div>
 <div className="grid gap-2">
 <Label>API Key / Account SID</Label>
 <Input type="password" placeholder="••••••••" disabled />
 </div>
 </div>
 <p className="text-xs text-muted-foreground italic">SMS integration is currently in development.</p>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="academic" className="space-y-6 mt-6">
 <Card>
 <CardHeader>
 <CardTitle>Academic Cycle</CardTitle>
 <CardDescription>
 Configure current academic years and semesters.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="grid gap-2">
 <Label>Current Academic Year</Label>
 <Input
 value={getSettingValue("academic_year","2025-2026")}
 onChange={(e) => updateSettingLocal("academic_year", e.target.value,"Academic")}
 />
 </div>
 <div className="grid gap-2">
 <Label>Current Semester</Label>
 <Input
 value={getSettingValue("current_semester","Spring 2026")}
 onChange={(e) => updateSettingLocal("current_semester", e.target.value,"Academic")}
 />
 </div>
 </div>
 </CardContent>
 <CardFooter className="border-t p-4 flex justify-end">
 <Button onClick={() => handleSave("Academic")} disabled={saving}>
 {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
 Update Academic Info
 </Button>
 </CardFooter>
 </Card>
 </TabsContent>

 <TabsContent value="data" className="space-y-6 mt-6">
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Database className="h-5 w-5" /> Backup & Restore
 </CardTitle>
 <CardDescription>
 Export platform data as JSON or restore from a previous backup.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
 <div className="space-y-1">
 <p className="font-medium">Export System Data</p>
 <p className="text-sm text-muted-foreground text-pretty">Download a full backup of students, companies, and training data.</p>
 </div>
 <Button variant="outline" disabled>
 <Download className="mr-2 h-4 w-4" /> Feature Coming Soon
 </Button>
 </div>

 <Separator />

 <div className="space-y-4">
 <p className="font-medium">Restore from Backup</p>
 <div className="flex items-center gap-4">
 <Input type="file" className="max-w-xs" accept=".json" />
 <Button variant="secondary" disabled>
 <Upload className="mr-2 h-4 w-4" /> Upload & Restore
 </Button>
 </div>
 <p className="text-[10px] text-destructive font-medium uppercase tracking-widest leading-relaxed mt-2">
 ⚠️ Caution: Restoration will overwrite existing data. Proceed with extreme care.
 </p>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="security" className="space-y-6 mt-6">
 <Card>
 <CardHeader>
 <CardTitle>Access Control</CardTitle>
 <CardDescription>
 Manage security settings and user access policies.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between rounded-lg border p-4">
 <div className="space-y-0.5">
 <Label className="text-base">Student Registration</Label>
 <p className="text-sm text-muted-foreground">
 Allow new student accounts to register automatically.
 </p>
 </div>
 <Switch />
 </div>
 <div className="space-y-2">
 <Label>Admin Access - Whitelisted Domains</Label>
 <Input defaultValue="college.edu" />
 <p className="text-[0.8rem] text-muted-foreground">
 Comma separated list of email domains allowed for admin access.
 </p>
 </div>
 </CardContent>
 <CardFooter className="border-t p-4 flex justify-end">
 <Button variant="destructive">
 Update Security Policy
 </Button>
 </CardFooter>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 )
}

