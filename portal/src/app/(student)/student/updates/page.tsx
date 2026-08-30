"use client"

import { useState } from "react"
import { CheckCheck, Inbox } from "lucide-react"
import { useNotifications } from "@/contexts/notification-context"
import { NotificationContent } from "@/components/layout/dashboard/notification-content"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Heading } from "@/components/ui/heading"

export default function UpdatesPage() {
  const { notifications, markAsRead, markAllAsRead, isLoading } = useNotifications()
  const [activeTab, setActiveTab] = useState("all")

  const unreadNotifications = notifications.filter((notification) => !notification.isRead)
  const readNotifications = notifications.filter((notification) => notification.isRead)
  const filteredNotifications = activeTab === "unread"
    ? unreadNotifications
    : activeTab === "read"
      ? readNotifications
      : notifications

  return (
    <div className="space-y-7">
      <PageHeader
        title="Updates"
        description="Placement, training, and account activity in one focused feed."
        action={unreadNotifications.length > 0 ? (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void markAllAsRead()}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        ) : undefined}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto h-auto min-h-0 justify-start rounded-md border border-border/70 bg-card p-1 flex overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1 shadow-xs scroll-smooth">
            <TabsTrigger value="all" className="group h-auto rounded-sm px-3.5 py-2 text-xs font-semibold flex items-center gap-2">
              <Inbox className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
              <span>All</span>
              <span className="ml-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-bold font-mono group-data-[state=active]:bg-amber-500/20 group-data-[state=active]:text-amber-200 group-data-[state=active]:border group-data-[state=active]:border-amber-500/30">
                {notifications.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="unread" className="group h-auto rounded-sm px-3.5 py-2 text-xs font-semibold flex items-center gap-2">
              <CheckCheck className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
              <span>Unread</span>
              {unreadNotifications.length > 0 && (
                <span className="ml-1 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold font-mono group-data-[state=active]:bg-amber-500/20 group-data-[state=active]:text-amber-200">
                  {unreadNotifications.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="group h-auto rounded-sm px-3.5 py-2 text-xs font-semibold flex items-center gap-2">
              <CheckCheck className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
              <span>Read</span>
            </TabsTrigger>
          </TabsList>
          <p className="text-xs font-medium text-muted-foreground">
            {unreadNotifications.length > 0 ? `${unreadNotifications.length} update${unreadNotifications.length === 1 ? "" : "s"} need your attention` : "You are all caught up"}
          </p>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card className="overflow-hidden border-border/70 shadow-sm">
            <CardContent className="p-0">
              {isLoading && notifications.length === 0 ? (
                <div className="space-y-3 p-5" aria-label="Loading updates">
                  {[0, 1, 2, 3].map((item) => <div key={item} className="h-24 animate-pulse rounded-md bg-muted/70" />)}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-16 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-amber-500/10 text-amber-700">
                    {activeTab === "unread" ? <CheckCheck className="h-6 w-6" aria-hidden="true" /> : <Inbox className="h-6 w-6" aria-hidden="true" />}
                  </div>
                  <Heading variant="section-title" className="mt-4">{activeTab === "unread" ? "You are all caught up" : "No updates here yet"}</Heading>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {activeTab === "unread" ? "New updates will appear here when there is something that needs your attention." : "Placement, training, and account activity will appear here as it happens."}
                  </p>
                </div>
              ) : (
                <div role="list" className="divide-y divide-border/70">
                  {filteredNotifications.map((notification) => (
                    <article
                      key={notification.id}
                      role="listitem"
                      className={cn("group relative transition-colors hover:bg-brown-800/[0.025]", !notification.isRead && "bg-amber-500/[0.06]")}
                    >
                      <NotificationContent notification={notification} />
                      {!notification.isRead && (
                        <div className="absolute bottom-4 right-5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs font-semibold text-brown-800 hover:bg-brown-800/5"
                            onClick={() => void markAsRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        </div>
                      )}
                    </article>
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
