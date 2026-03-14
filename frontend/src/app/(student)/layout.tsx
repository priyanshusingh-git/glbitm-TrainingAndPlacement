
import { cookies } from"next/headers"
import StudentClientLayout from"@/app/(student)/client-layout"

export default async function StudentLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const cookieStore = await cookies()
 const collapsed = cookieStore.get("sidebar-collapsed")?.value ==="true"

 return (
 <StudentClientLayout defaultCollapsed={collapsed}>
 {children}
 </StudentClientLayout>
 )
}
