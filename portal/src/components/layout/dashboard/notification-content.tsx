import { AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Notification } from "@/contexts/notification-context"
import { cn } from "@/lib/utils"

const notificationStyles = {
  INFO: {
    icon: Info,
    iconClassName: "bg-brown-800/8 text-brown-700",
    label: "Update",
  },
  WARNING: {
    icon: AlertTriangle,
    iconClassName: "bg-amber-500/12 text-amber-700",
    label: "Important",
  },
  SUCCESS: {
    icon: CheckCircle2,
    iconClassName: "bg-success/12 text-success",
    label: "Completed",
  },
} as const

export function NotificationContent({
  notification,
  compact = false,
}: {
  notification: Notification
  compact?: boolean
}) {
  const style = notificationStyles[notification.type] || notificationStyles.INFO
  const Icon = style.icon

  return (
    <div className={cn("flex min-w-0 items-start gap-3", compact ? "py-3" : "p-4 sm:p-5")}>
      <div className={cn("mt-0.5 grid shrink-0 place-items-center rounded-md", compact ? "h-8 w-8" : "h-10 w-10", style.iconClassName)}>
        <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={cn("min-w-0 flex-1 leading-snug", compact ? "text-sm" : "text-[15px]", notification.isRead ? "font-medium text-foreground/75" : "font-semibold text-foreground")}>
            {notification.title}
          </p>
          {!notification.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-label="Unread" />}
        </div>
        <p className={cn("mt-1 text-muted-foreground", compact ? "line-clamp-2 text-xs leading-relaxed" : "text-sm leading-relaxed")}>
          {notification.message}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[11px] font-medium text-muted-foreground/75">
          <span>{style.label}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={notification.createdAt}>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</time>
        </div>
      </div>
    </div>
  )
}
