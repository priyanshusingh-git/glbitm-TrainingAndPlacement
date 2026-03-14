
import { Metadata } from"next";
import StudentsPage from"@/modules/students/components/students-client";

export const metadata: Metadata = {
 title:"Students - Admin Dashboard",
 description:"Manage student records, track placement status, and academic progress.",
};

export default function Page() {
 return <StudentsPage />;
}
