import { Metadata } from "next"
import RecruiterDashboardClient from "@/modules/recruiter/components/recruiter-dashboard-client"

export const metadata: Metadata = {
  title: "Dashboard - Recruiter Portal",
  description: "View your company's recruitment progress.",
}

export default function RecruiterDashboardPage() {
  return <RecruiterDashboardClient />
}
