"use client"

import { useAuth } from"@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar"
import { Badge } from"@/components/ui/badge"
import { Mail, Shield, User } from"lucide-react"
import { Switch } from"@/components/ui/switch"
import { Label } from"@/components/ui/label"
import { useSidebar } from"@/components/layout/dashboard/dashboard-layout"

export default function TrainerProfilePage() {
 const { user } = useAuth()

 if (!user) return null

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
 <p className="text-muted-foreground">Manage your account settings.</p>
 </div>

 <div className="grid gap-6 md:grid-cols-2">
 <Card>
 <CardHeader>
 <CardTitle>Personal Information</CardTitle>
 <CardDescription>Your basic account details.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="flex items-center gap-4">
 <Avatar className="h-20 w-20">
 <AvatarImage src={user.photoUrl} />
 <AvatarFallback className="text-2xl">
 {user.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'TR'}
 </AvatarFallback>
 </Avatar>
 <div>
 <h3 className="text-xl font-semibold">{user.name}</h3>
 <div className="flex items-center gap-2 text-muted-foreground">
 <Badge variant="secondary">{user.role}</Badge>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="flex items-center gap-3 p-3 border rounded-md">
 <Mail className="h-5 w-5 text-muted-foreground" />
 <div>
 <p className="text-sm font-medium">Email Address</p>
 <p className="text-sm text-muted-foreground">{user.email}</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 border rounded-md">
 <User className="h-5 w-5 text-muted-foreground" />
 <div>
 <p className="text-sm font-medium">User ID</p>
 <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
 </div>
 </div>

 <div className="flex items-center gap-3 p-3 border rounded-md">
 <Shield className="h-5 w-5 text-muted-foreground" />
 <div>
 <p className="text-sm font-medium">Account Status</p>
 <p className="text-sm text-green-600 font-medium flex items-center gap-1">
 Active
 </p>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Account Actions</CardTitle>
 <CardDescription>Update your security settings.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <p className="text-sm text-muted-foreground">
 To change your password, please use the"Change Password" option in the top-right user menu.
 </p>
 <Button variant="outline" className="w-full justify-start" disabled>
 Edit Profile Details (Contact Admin)
 </Button>
 </CardContent>
 </Card>
 </div>

 </div>
 )
}
