"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card"
import { Label } from"@/components/ui/label"
import { Switch } from"@/components/ui/switch"
import { useSidebar } from"@/components/layout/dashboard/dashboard-layout"
import { PageHeader } from "@/components/layout/page-header"

export default function StudentSettingsPage() {
 const { expandOnHover, setExpandOnHover } = useSidebar()

 return (
 <div className="flex flex-col gap-8 pb-12 animate-fade-up stagger-1">
 <PageHeader
 title="Settings"
 description="Manage your dashboard preferences."
 />

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
