"use client"

import React, { useState } from"react"
import { Bell, BellRing, CheckCheck, Search, Menu, PanelLeft, Home, ChevronLeft, Loader2 } from"lucide-react"
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
import { getAuthErrorMessage } from"@/lib/auth-ui-messages"
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar"
import { Badge } from"@/components/ui/badge"
import Link from"next/link"
import { useNotifications } from"@/contexts/notification-context"
import { useSidebar } from"@/components/layout/dashboard/dashboard-layout"
import { useAuth } from"@/contexts/auth-context"
import { cn } from"@/lib/utils"
import { NotificationContent } from "@/components/layout/dashboard/notification-content"

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
 const { notifications, unreadCount, isLoading: notificationsLoading, markAsRead, markAllAsRead } = useNotifications();
 const { logout, isLoggingOut } = useAuth();

 const [changePasswordOpen, setChangePasswordOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const { toast } = useToast()
 const pathname = usePathname()

 const [passwordData, setPasswordData] = useState({
 newPassword:"",
 confirmPassword:""
 });

  const generateBreadcrumbs = () => {
    const rawPaths = pathname.split('/').filter(Boolean)
    // Filter out internal grouping segments like 'portfolio' from header navigation
    const paths = rawPaths.filter((p) => p !== 'portfolio')
    const breadcrumbs = paths.map((path, index) => {
      const rawIndex = rawPaths.indexOf(path)
      const href = `/${rawPaths.slice(0, rawIndex + 1).join('/')}`

      // Better label formatting
      let label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')

      // Special cases for common ID patterns or tactical terms
      if (path.length > 20 && (path.includes('-') || /^\d+$/.test(path))) {
        label = "Details"
      } else if (label.toLowerCase() === "training") {
        label = "Training"
      } else if (label.toLowerCase() === "personnel") {
        label = "Students"
      } else if (label.toLowerCase() === "mentors") {
        label = "Trainers"
      } else if (label.toLowerCase() === "intelligence") {
        label = "Overview"
      }

      return { href, label, isLast: index === paths.length - 1 }
    })
    return breadcrumbs
  }

 const breadcrumbs = generateBreadcrumbs()
 const recentNotifications = notifications.slice(0, 6)
 const notificationHistoryHref = role === "student" ? "/student/updates" : role === "admin" ? "/admin/updates" : null

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
 title:"Password update failed",
 description: getAuthErrorMessage(error, { flow:"change-password" }),
 })
 } finally {
 setLoading(false);
 }
 };

 return (
 <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
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
 <Button
 variant="ghost"
 size="icon"
 className="relative"
 aria-label={unreadCount > 0 ? `${unreadCount} unread updates` : "Updates"}
 >
 <Bell className="h-5 w-5" />
 {unreadCount > 0 && (
 <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 p-0 text-[10px] font-bold text-brown-900 shadow-[0_0_0_2px_hsl(var(--background))]">
 {unreadCount > 9 ? '9+' : unreadCount}
 </Badge>
 )}
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] overflow-hidden rounded-md border-border/70 p-0 sm:w-[25rem]">
 <div className="flex items-center justify-between border-b border-border/70 bg-brown-50/70 px-4 py-3.5">
 <div className="flex items-center gap-2.5">
 <div className="grid h-8 w-8 place-items-center rounded-md bg-brown-800 text-cream">
 <BellRing className="h-4 w-4" aria-hidden="true" />
 </div>
 <div>
 <p className="text-sm font-semibold text-foreground">Updates</p>
 <p className="text-[11px] font-medium text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You are all caught up"}</p>
 </div>
 </div>
 {unreadCount > 0 && (
 <Button
 variant="ghost"
 size="sm"
 className="h-8 gap-1.5 px-2 text-xs text-brown-800 hover:bg-brown-800/5"
 onClick={(e) => {
 e.preventDefault();
 markAllAsRead();
 }}
 >
 <CheckCheck className="h-3.5 w-3.5" />
 Mark all read
 </Button>
 )}
 </div>
 <div className="max-h-[390px] overflow-y-auto p-2">
 {notificationsLoading && notifications.length === 0 ? (
 <div className="space-y-3 p-3" aria-label="Loading updates">
 {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-md bg-muted/70" />)}
 </div>
 ) : notifications.length === 0 ? (
 <div className="flex flex-col items-center px-6 py-10 text-center">
 <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-500/10 text-amber-700">
 <Bell className="h-5 w-5" aria-hidden="true" />
 </div>
 <p className="mt-3 text-sm font-semibold text-foreground">No updates yet</p>
 <p className="mt-1 text-xs leading-relaxed text-muted-foreground">New placement, training, and account updates will appear here.</p>
 </div>
 ) : (
 recentNotifications.map((notification) => (
 <DropdownMenuItem
 key={notification.id}
 className={cn(
 "cursor-pointer rounded-md px-3 last:border-0 focus:bg-brown-800/5",
 !notification.isRead && "bg-amber-500/7"
 )}
 onSelect={() => {
 if (!notification.isRead) void markAsRead(notification.id)
 }}
 >
 <NotificationContent notification={notification} compact />
 </DropdownMenuItem>
 ))
 )}
 </div>
 {notifications.length > recentNotifications.length && <div className="border-t border-border/70 px-4 py-2 text-center text-xs text-muted-foreground">Showing the latest {recentNotifications.length} updates</div>}
 <DropdownMenuSeparator className="m-0" />
 {notificationHistoryHref ? (
 <DropdownMenuItem className="justify-center py-3 font-semibold text-brown-800 transition-colors focus:bg-brown-800/5 focus:text-brown-800" asChild>
 <Link href={notificationHistoryHref}>View all updates</Link>
 </DropdownMenuItem>
 ) : (
 <div className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">The latest updates are shown above.</div>
 )}
 </DropdownMenuContent>
 </DropdownMenu>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" className="flex items-center gap-2 rounded-md px-2">
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
 <DropdownMenuContent align="end" className="w-56 rounded-md border-border/70">
 <DropdownMenuItem asChild>
 <Link href={role ==="student" ?"/student/profile" : role ==="admin" ?"/admin/settings" : role === "trainer" ? "/trainer/profile" : "/recruiter"}>Profile</Link>
 </DropdownMenuItem>
 <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setChangePasswordOpen(true); }} className="cursor-pointer">
 Change Password
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem onClick={logout} disabled={isLoggingOut} className="cursor-pointer text-red-600 focus:text-red-600 flex items-center gap-2">
 {isLoggingOut ? (
   <>
     <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
     <span>Signing Out...</span>
   </>
 ) : (
   <span>Sign out</span>
 )}
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>

 <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
 <DialogContent className="max-h-[85vh] overflow-y-auto rounded-md border-border/70">
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
 showBreachCheck={true}
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
