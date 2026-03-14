
import { Metadata } from"next";
import PlacementsPage from"@/app/(student)/student/placements/placements-client";

export const metadata: Metadata = {
 title:"Placement Drives - CDC Platform",
 description:"Explore and apply for campus placement opportunities.",
};

export default function Page() {
 return <PlacementsPage />;
}
