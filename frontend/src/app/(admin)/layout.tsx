
import { cookies } from"next/headers"
import AdminClientLayout from"@/app/(admin)/client-layout"

export default async function AdminLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const cookieStore = await cookies()
 const collapsed = cookieStore.get("sidebar-collapsed")?.value ==="true"

 return (
 <AdminClientLayout defaultCollapsed={collapsed}>
 {children}
 </AdminClientLayout>
 )
}
