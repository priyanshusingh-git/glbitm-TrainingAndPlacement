"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card"
import { Label } from"@/components/ui/label"
import { Switch } from"@/components/ui/switch"
import { useSidebar } from"@/components/layout/dashboard/dashboard-layout"

export default function TrainerSettingsPage() {
 const { expandOnHover, setExpandOnHover } = useSidebar()

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
 <p className="text-muted-foreground">Manage your dashboard preferences.</p>
 </div>

 <div className="grid gap-6">
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
 </div>
 </div>
 )
}
