
import { Metadata } from"next";
import StudentProfilePage from"@/modules/students/components/profile-client";

export const metadata: Metadata = {
 title:"My Profile - CDC Platform",
 description:"Manage your student profile and academic details.",
};

export default function Page() {
 return <StudentProfilePage />;
}
