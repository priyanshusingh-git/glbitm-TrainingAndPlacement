"use client"

import { useState } from"react"
import { useNotifications } from"@/contexts/notification-context"
import { formatDistanceToNow } from 'date-fns'
import { CheckCheck, MessageSquare, Info, AlertTriangle, CheckCircle } from"lucide-react"
import { Button } from"@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { Badge } from"@/components/ui/badge"

export default function AdminUpdatesPage() {
 const { notifications, markAsRead, isLoading } = useNotifications()
 const [activeTab, setActiveTab] = useState("all")

 const unreadNotifications = notifications.filter(n => !n.isRead)
 const readNotifications = notifications.filter(n => n.isRead)

 const getIcon = (type: string) => {
 switch (type) {
 case"WARNING": return <AlertTriangle className="h-5 w-5 text-yellow-500" />
 case"SUCCESS": return <CheckCircle className="h-5 w-5 text-green-500" />
 default: return <Info className="h-5 w-5 text-blue-500" />
 }
 }

 const filteredNotifications = activeTab ==="unread"
 ? unreadNotifications
 : activeTab ==="read"
 ? readNotifications
 : notifications

 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-2">
 <h1 className="text-3xl font-bold tracking-tight">Updates</h1>
 <p className="text-muted-foreground">
 Stay informed about platform activities and alerts.
 </p>
 </div>

 <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
 <div className="flex items-center justify-between mb-4">
 <TabsList>
 <TabsTrigger value="all">
 All
 <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
 </TabsTrigger>
 <TabsTrigger value="unread">
 Unread
 {unreadNotifications.length > 0 && (
 <Badge variant="destructive" className="ml-2">{unreadNotifications.length}</Badge>
 )}
 </TabsTrigger>
 <TabsTrigger value="read">Read</TabsTrigger>
 </TabsList>

 {unreadNotifications.length > 0 && (
 <Button variant="outline" size="sm" onClick={() => unreadNotifications.forEach(n => markAsRead(n.id))}>
 <CheckCheck className="mr-2 h-4 w-4" />
 Mark all as read
 </Button>
 )}
 </div>

 <TabsContent value={activeTab} className="mt-0">
 <Card>
 <CardHeader>
 <CardTitle>
 {activeTab === 'all' ? 'All Updates' : activeTab === 'unread' ? 'Unread Updates' : 'Read History'}
 </CardTitle>
 <CardDescription>
 {activeTab === 'unread' && unreadNotifications.length === 0
 ?"You're all caught up!"
 : `You have ${filteredNotifications.length} updates in this list.`}
 </CardDescription>
 </CardHeader>
 <CardContent>
 {isLoading ? (
 <div className="flex justify-center py-8">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-800"></div>
 </div>
 ) : filteredNotifications.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
 <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
 <p>No updates found</p>
 </div>
 ) : (
 <div className="space-y-4">
 {filteredNotifications.map((notification) => (
 <div
 key={notification.id}
 className={`flex items-start gap-4 rounded-md border p-4 transition-colors ${!notification.isRead ? 'bg-accent/10 border-accent/20' : 'bg-card'
 }`}
 >
 <div className="mt-1 shrink-0">
 {getIcon(notification.type)}
 </div>
 <div className="flex-1 space-y-1">
 <div className="flex items-center justify-between">
 <p className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
 {notification.title}
 </p>
 <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
 {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
 </span>
 </div>
 <p className="text-sm text-muted-foreground">
 {notification.message}
 </p>
 {!notification.isRead && (
 <div className="pt-2">
 <Button
 variant="ghost"
 size="sm"
 className="h-auto p-0 text-brown-800 text-xs hover:bg-transparent hover:text-brown-800/80"
 onClick={() => markAsRead(notification.id)}
 >
 Mark as read
 </Button>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 )
}
