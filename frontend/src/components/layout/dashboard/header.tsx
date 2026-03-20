"use client"

import React, { useState } from"react"
import { Bell, Search, Menu, PanelLeft, Home, ChevronLeft } from"lucide-react"
import { usePathname } from"next/navigation"
import {
 Breadcrumb,
 BreadcrumbItem,
 BreadcrumbLink,
 BreadcrumbList,
 BreadcrumbPage,
 BreadcrumbSeparator,
} from"@/components/ui/breadcrumb"
import { useToast } from"@/hooks/use-toast"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { PasswordInput } from"@/components/ui/password-input"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog"
import { api } from"@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar"
import { Badge } from"@/components/ui/badge"
import Link from"next/link"
import { useNotifications } from"@/contexts/notification-context"
import { formatDistanceToNow } from 'date-fns'
import { useSidebar } from"@/components/layout/dashboard/dashboard-layout"
import { useAuth } from"@/contexts/auth-context"
import { cn } from"@/lib/utils"

import { validateStrongPassword } from"@/lib/validators"

interface HeaderProps {
 role:"student" |"admin" |"trainer" |"recruiter"
 user: {
 name: string
 email: string
 avatar?: string
 initials: string
 }
 headerAction?: React.ReactNode
}

export function Header({ role, user, headerAction }: HeaderProps) {
 const { setMobileOpen, collapsed, setCollapsed } = useSidebar()
 const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
 const { logout } = useAuth();

 const [changePasswordOpen, setChangePasswordOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const { toast } = useToast()
 const pathname = usePathname()

 const [passwordData, setPasswordData] = useState({
 newPassword:"",
 confirmPassword:""
 });

 const generateBreadcrumbs = () => {
 const paths = pathname.split('/').filter(Boolean)
 const breadcrumbs = paths.map((path, index) => {
 const href = `/${paths.slice(0, index + 1).join('/')}`

 // Better label formatting
 let label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')

 // Special cases for common ID patterns or tactical terms
 if (path.length > 20 && (path.includes('-') || /^\d+$/.test(path))) {
 label ="Details"
 } else if (label.toLowerCase() ==="training") {
 label ="Training"
 } else if (label.toLowerCase() ==="personnel") {
 label ="Students"
 } else if (label.toLowerCase() ==="mentors") {
 label ="Trainers"
 } else if (label.toLowerCase() ==="intelligence") {
 label ="Overview"
 }

 return { href, label, isLast: index === paths.length - 1 }
 })
 return breadcrumbs
 }

 const breadcrumbs = generateBreadcrumbs()

 const handleChangePassword = async (e: React.FormEvent) => {
 e.preventDefault();
 if (passwordData.newPassword !== passwordData.confirmPassword) {
 toast({
 variant:"destructive",
 title:"Error",
 description:"New passwords do not match",
 })
 return;
 }

 const passwordError = validateStrongPassword(passwordData.newPassword);
 if (passwordError) {
 toast({
 variant:"destructive",
 title:"Weak Password",
 description: passwordError,
 })
 return;
 }

 try {
 setLoading(true);
 await api.post("/auth/change-password", {
 // currentPassword: passwordData.currentPassword, // Not required anymore
 newPassword: passwordData.newPassword
 });
 toast({
 title:"Success",
 description:"Password updated successfully",
 })
 setChangePasswordOpen(false);
 setPasswordData({ newPassword:"", confirmPassword:"" });
 } catch (error: any) {
 toast({
 variant:"destructive",
 title:"Error",
 description: error.response?.data?.error ||"Failed to update password",
 })
 } finally {
 setLoading(false);
 }
 };

 return (
 <header className="sticky top-0 z-30 border-b border-border/60 bg-background/78 backdrop-blur-xl">
 <div className="page-shell flex h-16 items-center justify-between gap-3">
 <div className="flex flex-1 items-center gap-2 md:gap-4">
 <Button
 variant="ghost"
 size="icon"
 className="md:hidden -ml-2 h-9 w-9 shrink-0"
 onClick={() => setMobileOpen(true)}
 >
 <Menu className="h-5 w-5" />
 <span className="sr-only">Toggle menu</span>
 </Button>

 <div className="hidden shrink-0 items-center gap-1 md:flex">
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9"
 onClick={() => setCollapsed(!collapsed)}
 >
 <PanelLeft className="h-5 w-5" />
 <span className="sr-only">Toggle sidebar</span>
 </Button>

 {breadcrumbs.length > 1 && (
 <Button
 variant="ghost"
 size="icon"
 className="h-9 w-9"
 onClick={() => window.history.back()}
 title="Go Back"
 >
 <ChevronLeft className="h-5 w-5" />
 <span className="sr-only">Back</span>
 </Button>
 )}
 </div>

 <div className="xs:block ml-1 min-w-0 flex-1 md:ml-2">
 <Breadcrumb>
 <BreadcrumbList className="flex-nowrap whitespace-nowrap overflow-hidden text-ellipsis">
 <BreadcrumbItem className="hidden sm:inline-flex shrink-0">
 <BreadcrumbLink asChild>
 <Link href={`/${role}`} className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground">
 <Home className="h-3.5 w-3.5" />
 <span className="hidden md:inline">Dashboard</span>
 </Link>
 </BreadcrumbLink>
 </BreadcrumbItem>
 {breadcrumbs.map((crumb, idx) => {
 if (idx === 0 && (crumb.label.toLowerCase() === role)) return null

 const isVisible = crumb.isLast || idx >= breadcrumbs.length - 2;

 if (!isVisible) return null;

 return (
 <React.Fragment key={crumb.href}>
 <BreadcrumbSeparator className={idx === 0 || (idx === 1 && breadcrumbs.length > 2) ?"hidden sm:block shrink-0" :"shrink-0"} />
 <BreadcrumbItem className={!crumb.isLast ?"hidden sm:inline-flex shrink-0" :"inline-flex min-w-0"}>
 {crumb.isLast ? (
 <BreadcrumbPage className="block max-w-[150px] truncate font-medium sm:max-w-[220px]">{crumb.label}</BreadcrumbPage>
 ) : (
 <BreadcrumbLink asChild>
 <Link href={crumb.href} className="block max-w-[100px] truncate text-muted-foreground hover:text-foreground sm:max-w-none">{crumb.label}</Link>
 </BreadcrumbLink>
 )}
 </BreadcrumbItem>
 </React.Fragment>
 )
 })}
 </BreadcrumbList>
 </Breadcrumb>
 </div>

 {role !=="admin" && role !=="student" && (
 <div className="relative hidden w-full max-w-sm lg:block">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <Input
 type="search"
 placeholder="Search"
 className="h-10 w-full bg-card pl-9"
 />
 </div>
 )}
 </div>

 <div className="flex shrink-0 items-center gap-2">
 {headerAction && (
 <div className="hidden md:block mr-2">
 {headerAction}
 </div>
 )}
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="relative">
 <Bell className="h-5 w-5" />
 {unreadCount > 0 && (
 <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
 {unreadCount}
 </Badge>
 )}
 <span className="sr-only">Updates</span>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-80 rounded-xl border-border/70">
 <div className="flex items-center justify-between border-b px-4 py-3">
 <span className="font-semibold text-sm">Updates</span>
 {unreadCount > 0 && (
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 text-xs text-brown-800 hover:bg-transparent hover:underline"
 onClick={(e) => {
 e.preventDefault();
 markAllAsRead();
 }}
 >
 Mark all as read
 </Button>
 )}
 </div>
 <div className="max-h-[350px] overflow-y-auto">
 {notifications.length === 0 ? (
 <div className="py-8 text-center text-sm text-muted-foreground">
 No updates yet
 </div>
 ) : (
 notifications.slice(0, 50).map((notification) => (
 <DropdownMenuItem
 key={notification.id}
 className={cn(
"group cursor-pointer flex-col items-start gap-1 border-b px-4 py-3 last:border-0",
 !notification.isRead &&"bg-accent/30"
 )}
 onClick={() => markAsRead(notification.id)}
 >
 <div className="flex justify-between w-full items-start gap-2">
 <span className={cn(
"text-sm leading-none transition-colors",
 !notification.isRead ?"font-bold text-foreground" :"font-medium text-muted-foreground"
 )}>
 {notification.title}
 </span>
 {!notification.isRead && (
 <span className="h-2 w-2 shrink-0 rounded-full bg-brown-800 mt-1" />
 )}
 </div>
 <span className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{notification.message}</span>
 <span className="text-[10px] text-muted-foreground/60 font-medium">
 {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
 </span>
 </DropdownMenuItem>
 ))
 )}
 </div>
 <DropdownMenuSeparator className="m-0" />
 <DropdownMenuItem className="justify-center py-2.5 font-medium text-brown-800 transition-colors focus:bg-brown-800/5 focus:text-brown-800" asChild>
 <Link href={role ==="student" ?"/student/updates" : role === "admin" ?"/admin/updates" : role === "trainer" ? "/trainer" : "/recruiter"}>View all updates</Link>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" className="flex items-center gap-2 rounded-xl px-2">
 <Avatar className="h-8 w-8">
 <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
 <AvatarFallback className="border border-border bg-card text-xs font-medium text-foreground">
 {user.initials}
 </AvatarFallback>
 </Avatar>
 <div className="hidden md:flex flex-col items-start">
 <span className="text-sm font-medium">{user.name}</span>
 <span className="text-xs text-muted-foreground capitalize">{role}</span>
 </div>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/70">
 <DropdownMenuLabel>My Account</DropdownMenuLabel>
 <DropdownMenuSeparator />
 <DropdownMenuItem asChild>
 <Link href={role ==="student" ?"/student/profile" : role ==="admin" ?"/admin/settings" : role === "trainer" ? "/trainer/profile" : "/recruiter"}>Profile</Link>
 </DropdownMenuItem>
 <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setChangePasswordOpen(true); }} className="cursor-pointer">
 Change Password
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
 Sign out
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>

 <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
 <DialogContent className="rounded-2xl border-border/70">
 <DialogHeader>
 <DialogTitle>Change Password</DialogTitle>
 <DialogDescription>
 Enter a new password to update your credentials.
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleChangePassword} className="space-y-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">New Password</label>
 <PasswordInput
 value={passwordData.newPassword}
 onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
 required
 minLength={8}
 showStrength={true}
 placeholder="Enter new password"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium">Confirm New Password</label>
 <PasswordInput
 value={passwordData.confirmPassword}
 onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
 required
 minLength={8}
 placeholder="Confirm new password"
 />
 </div>
 <DialogFooter>
 <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
 <Button type="submit" disabled={loading}>
 {loading ?"Updating..." :"Update Password"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </header>
 )
}
