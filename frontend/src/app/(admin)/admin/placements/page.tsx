
import { Metadata } from"next";
import AdminPlacementsPage from"@/modules/drives/components/placements-client";

export const metadata: Metadata = {
 title:"Placement Drives - CDC Platform",
 description:"Schedule and manage recruitment drives.",
};

export default function Page() {
 return <AdminPlacementsPage />;
}
