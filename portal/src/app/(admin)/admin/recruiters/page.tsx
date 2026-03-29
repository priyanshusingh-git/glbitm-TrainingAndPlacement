import { Metadata } from "next"
import RecruitersClient from "@/modules/recruiters/components/recruiters-client"

export const metadata: Metadata = {
  title: "Manage Recruiters - GL Bajaj T&P",
  description: "Create and manage recruiter accounts.",
}

export default function RecruitersPage() {
  return <RecruitersClient />
}
