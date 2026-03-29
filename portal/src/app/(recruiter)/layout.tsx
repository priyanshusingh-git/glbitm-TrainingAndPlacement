
import { cookies } from"next/headers"
import TrainerClientLayout from"@/app/(recruiter)/client-layout"

export default async function TrainerLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const cookieStore = await cookies()
 const collapsed = cookieStore.get("sidebar-collapsed")?.value ==="true"

 return (
 <TrainerClientLayout defaultCollapsed={collapsed}>
 {children}
 </TrainerClientLayout>
 )
}
